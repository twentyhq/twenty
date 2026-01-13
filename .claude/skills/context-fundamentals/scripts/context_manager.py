"""
Context Management Utilities

This module provides utilities for managing context in agent systems.

Note: This module uses simplified estimation functions for demonstration.
Production systems should use actual tokenizers (tiktoken for OpenAI,
model-specific tokenizers for other providers) for accurate token counts.
"""

from typing import Dict, List
import hashlib


def estimate_token_count(text: str) -> int:
    """
    Estimate token count for text.
    
    Uses approximation: ~4 characters per token for English.
    
    WARNING: This is a rough estimate for demonstration purposes.
    Production systems should use actual tokenizers:
    - OpenAI: tiktoken library
    - Anthropic: Model-specific tokenizers
    - Other: Provider-specific tokenization
    
    Actual tokenization varies by:
    - Model architecture
    - Content type (code vs prose)
    - Language (non-English typically has higher token/char ratio)
    """
    return len(text) // 4


def estimate_message_tokens(messages: list) -> int:
    """Estimate token count for message list."""
    total = 0
    for msg in messages:
        content = msg.get("content", "")
        total += estimate_token_count(content)
        total += 10  # Overhead for role/formatting
    return total


def count_tokens_by_type(context: Dict) -> Dict:
    """Break down token usage by context type."""
    breakdown = {
        "system_prompt": 0,
        "tool_definitions": 0,
        "retrieved_documents": 0,
        "message_history": 0,
        "tool_outputs": 0,
        "other": 0
    }
    
    # System prompt
    if "system" in context:
        breakdown["system_prompt"] = estimate_token_count(context["system"])
    
    # Tool definitions
    if "tools" in context:
        for tool in context["tools"]:
            breakdown["tool_definitions"] += estimate_token_count(str(tool))
    
    # Retrieved documents
    if "documents" in context:
        for doc in context["documents"]:
            breakdown["retrieved_documents"] += estimate_token_count(doc)
    
    # Message history
    if "messages" in context:
        breakdown["message_history"] = estimate_message_tokens(context["messages"])
    
    return breakdown


# Context Builder

class ContextBuilder:
    """Build context with budget management."""
    
    def __init__(self, context_limit: int = 100000):
        self.context_limit = context_limit
        self.sections: Dict[str, str] = {}
        self.order: List[str] = []
    
    def add_section(self, name: str, content: str, 
                    priority: int = 0, category: str = "other"):
        """Add section to context."""
        if name not in self.sections:
            self.order.append(name)
        
        self.sections[name] = {
            "content": content,
            "priority": priority,
            "category": category,
            "tokens": estimate_token_count(content)
        }
    
    def build(self, max_tokens: int = None) -> str:
        """Build context within token limit."""
        limit = max_tokens or self.context_limit
        
        # Sort by priority (higher first)
        sorted_sections = sorted(
            self.order,
            key=lambda n: self.sections[n]["priority"],
            reverse=True
        )
        
        # Build context
        context_parts = []
        current_tokens = 0
        
        for name in sorted_sections:
            section = self.sections[name]
            section_tokens = section["tokens"]
            
            if current_tokens + section_tokens <= limit:
                context_parts.append(section["content"])
                current_tokens += section_tokens
        
        return "\n\n".join(context_parts)
    
    def get_usage_report(self) -> Dict:
        """Get current context usage report."""
        total = sum(s["tokens"] for s in self.sections.values())
        return {
            "total_tokens": total,
            "limit": self.context_limit,
            "utilization": total / self.context_limit,
            "by_section": {
                name: s["tokens"] 
                for name, s in self.sections.items()
            },
            "status": self._get_status(total)
        }
    
    def _get_status(self, total: int) -> str:
        """Get status based on utilization."""
        ratio = total / self.context_limit
        if ratio > 0.9:
            return "critical"
        elif ratio > 0.7:
            return "warning"
        else:
            return "healthy"


# Context Truncation

def truncate_context(context: str, max_tokens: int, 
                     preserve_start: bool = True) -> str:
    """
    Truncate context to fit within token limit.
    
    Args:
        context: Full context string
        max_tokens: Maximum tokens to keep
        preserve_start: If True, preserve beginning; otherwise preserve end
    
    Returns:
        Truncated context
    """
    tokens = context.split()
    current_tokens = len(tokens)
    
    if current_tokens <= max_tokens:
        return context
    
    if preserve_start:
        # Keep beginning, truncate end
        kept = tokens[:max_tokens]
    else:
        # Keep end, truncate beginning
        kept = tokens[-max_tokens:]
    
    return " ".join(kept)


def truncate_messages(messages: list, max_tokens: int) -> list:
    """
    Truncate message history while preserving structure.
    
    Strategy:
    1. Always keep system prompt
    2. Keep recent messages
    3. Summarize older messages if needed
    """
    system_prompt = None
    recent_messages = []
    summary = None
    
    for msg in messages:
        if msg["role"] == "system":
            system_prompt = msg
        elif msg.get("is_summary"):
            summary = msg
        else:
            recent_messages.append(msg)
    
    # Calculate token usage
    tokens_for_system = estimate_token_count(system_prompt["content"]) if system_prompt else 0
    tokens_for_recent = estimate_message_tokens(recent_messages)
    tokens_for_summary = estimate_token_count(summary["content"]) if summary else 0
    
    available = max_tokens - tokens_for_system - tokens_for_summary
    
    # Truncate recent if needed
    if tokens_for_recent > available:
        # Keep most recent messages
        truncated_recent = []
        current_tokens = 0
        
        for msg in reversed(recent_messages):
            msg_tokens = estimate_token_count(msg.get("content", ""))
            if current_tokens + msg_tokens <= available:
                truncated_recent.insert(0, msg)
                current_tokens += msg_tokens
        
        recent_messages = truncated_recent
    
    result = []
    if system_prompt:
        result.append(system_prompt)
    if summary:
        result.append(summary)
    result.extend(recent_messages)
    
    return result


# Context Validation

def validate_context_structure(context: Dict) -> Dict:
    """
    Validate context structure for common issues.
    
    Returns validation results with issues and recommendations.
    """
    issues = []
    recommendations = []
    
    # Check for empty sections
    for section, content in context.items():
        if not content:
            issues.append(f"Empty {section} section")
            recommendations.append(f"Remove or populate {section}")
    
    # Check for excessive length
    total_tokens = sum(estimate_token_count(str(c)) for c in context.values())
    if total_tokens > 80000:
        issues.append(f"Context length ({total_tokens} tokens) exceeds recommended limit")
        recommendations.append("Consider context compaction or partitioning")
    
    # Check for missing sections
    recommended_sections = ["system", "task"]
    for section in recommended_sections:
        if section not in context:
            issues.append(f"Missing recommended section: {section}")
            recommendations.append(f"Add {section} section with relevant information")
    
    # Check for duplicate information
    # Using hashlib instead of hash() for cross-process consistency
    seen_content = set()
    for section, content in context.items():
        content_str = str(content)[:1000]  # First 1000 chars
        content_hash = hashlib.md5(content_str.encode()).hexdigest()
        if content_hash in seen_content:
            issues.append(f"Potential duplicate content in {section}")
        seen_content.add(content_hash)
    
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "recommendations": recommendations
    }


# Progressive Disclosure

class ProgressiveDisclosureManager:
    """Manage progressive disclosure of context."""
    
    def __init__(self, base_dir: str = "."):
        self.base_dir = base_dir
        self.loaded_files: Dict[str, str] = {}
    
    def load_summary(self, summary_path: str) -> str:
        """Load summary without loading full content."""
        if summary_path in self.loaded_files:
            return self.loaded_files[summary_path]
        
        try:
            with open(summary_path, 'r') as f:
                content = f.read()
            self.loaded_files[summary_path] = content
            return content
        except FileNotFoundError:
            return ""
    
    def load_detail(self, detail_path: str, force: bool = False) -> str:
        """Load detailed content on demand."""
        if not force and detail_path in self.loaded_files:
            return self.loaded_files[detail_path]
        
        try:
            with open(detail_path, 'r') as f:
                content = f.read()
            self.loaded_files[detail_path] = content
            return content
        except FileNotFoundError:
            return ""
    
    def get_contextual_info(self, reference: Dict) -> str:
        """
        Get information following progressive disclosure.
        
        Returns summary if available, loads detail if needed.
        """
        summary_path = reference.get("summary_path")
        detail_path = reference.get("detail_path")
        need_detail = reference.get("need_detail", False)
        
        if need_detail and detail_path:
            return self.load_detail(detail_path)
        elif summary_path:
            return self.load_summary(summary_path)
        else:
            return ""


# Usage Example

def build_agent_context(task: str, system_prompt: str, 
                        documents: List[str] = None) -> Dict:
    """Build optimized context for agent task."""
    builder = ContextBuilder(context_limit=80000)
    
    # Add system prompt (highest priority)
    builder.add_section("system", system_prompt, priority=10, 
                        category="system")
    
    # Add task description
    builder.add_section("task", task, priority=9, category="task")
    
    # Add retrieved documents
    if documents:
        for i, doc in enumerate(documents):
            builder.add_section(
                f"document_{i}", 
                doc, 
                priority=5, 
                category="retrieved"
            )
    
    # Build and validate
    context = {
        "system": system_prompt,
        "task": task,
        "documents": documents or []
    }
    
    validation = validate_context_structure(context)
    
    return {
        "context": builder.build(),
        "usage_report": builder.get_usage_report(),
        "validation": validation
    }
