"""
Context Optimization Utilities

This module provides utilities for context compaction, observation masking, and budget management.

PRODUCTION NOTES:
- Token estimation uses simplified heuristics (~4 chars/token for English).
  Production systems should use model-specific tokenizers:
  - OpenAI: tiktoken library
  - Anthropic: anthropic tokenizer
  - Local models: HuggingFace tokenizers
  
- Summarization functions use simple heuristics for demonstration.
  Production systems should use:
  - LLM-based summarization for high-quality compression
  - Domain-specific summarization models
  - Schema-based summarization for structured outputs
  
- Cache metrics are illustrative. Production systems should integrate
  with actual inference infrastructure metrics.
"""

from typing import List, Dict
import hashlib
import time


def estimate_token_count(text: str) -> int:
    """
    Estimate token count for text.
    
    Uses approximation: ~4 characters per token for English.
    
    WARNING: This is a rough estimate. Actual tokenization varies by:
    - Model (GPT-5.2, Claude 4.5, Gemini 3 have different tokenizers)
    - Content type (code typically has higher token density)
    - Language (non-English may have 2-3x higher token/char ratio)
    
    Production usage:
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4")  # Use appropriate model
        token_count = len(enc.encode(text))
    """
    return len(text) // 4


def estimate_message_tokens(messages: list) -> int:
    """Estimate token count for message list."""
    total = 0
    for msg in messages:
        # Count content
        content = msg.get("content", "")
        total += estimate_token_count(content)
        
        # Add overhead for role/formatting
        total += 10
    
    return total


# Compaction Functions

def categorize_messages(messages: list) -> dict:
    """
    Categorize messages for selective compaction.
    
    Returns dict mapping category to messages.
    """
    categories = {
        "system_prompt": [],
        "tool_definition": [],
        "tool_output": [],
        "conversation": [],
        "retrieved_document": [],
        "other": []
    }
    
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        
        if role == "system":
            categories["system_prompt"].append({**msg, "category": "system_prompt"})
        elif "tool_use" in msg.get("type", ""):
            categories["tool_output"].append({**msg, "category": "tool_output"})
        elif role == "user":
            categories["conversation"].append({**msg, "category": "conversation"})
        elif "retrieved" in msg.get("tags", []):
            categories["retrieved_document"].append({**msg, "category": "retrieved_document"})
        else:
            categories["other"].append({**msg, "category": "other"})
    
    return categories


def summarize_content(content: str, category: str, max_length: int = 500) -> str:
    """
    Summarize content for compaction.
    
    Different summarization for different categories.
    """
    if category == "tool_output":
        return summarize_tool_output(content, max_length)
    elif category == "conversation":
        return summarize_conversation(content, max_length)
    elif category == "retrieved_document":
        return summarize_document(content, max_length)
    else:
        return summarize_general(content, max_length)


def summarize_tool_output(content: str, max_length: int = 500) -> str:
    """Summarize tool output."""
    # Extract key metrics and findings
    import re
    
    # Look for metrics (numbers with context)
    metrics = re.findall(r'(\w+):\s*([\d.,]+)', content)
    
    # Look for key findings (lines with important keywords)
    keywords = ["result", "found", "total", "success", "error", "value"]
    findings = []
    for line in content.split('\n'):
        if any(kw in line.lower() for kw in keywords):
            findings.append(line.strip())
    
    summary_parts = []
    if metrics:
        summary_parts.append(f"Metrics: {', '.join([f'{k}={v}' for k, v in metrics])}")
    if findings:
        summary_parts.append("Key findings: " + "; ".join(findings[:3]))
    
    result = " | ".join(summary_parts) if summary_parts else "[Tool output summarized]"
    return result[:max_length]


def summarize_conversation(content: str, max_length: int = 500) -> str:
    """Summarize conversational content."""
    # Identify key decisions and questions
    import re
    
    decisions = re.findall(r'(?i)(?:decided|decision|chose|chosen)[:\s]+([^.]+)', content)
    questions = re.findall(r'(?:\?|question)[:\s]+([^.]+)', content)
    
    summary_parts = []
    if decisions:
        summary_parts.append(f"Decisions: {len(decisions)} made")
    if questions:
        summary_parts.append(f"Questions: {len(questions)} raised")
    
    result = " | ".join(summary_parts) if summary_parts else "[Conversation summarized]"
    return result[:max_length]


def summarize_document(content: str, max_length: int = 500) -> str:
    """Summarize document content."""
    # Extract first paragraph as summary
    paragraphs = content.split('\n\n')
    if paragraphs:
        first_para = paragraphs[0].strip()
        # Truncate to first few sentences
        sentences = first_para.split('. ')
        if len(sentences) > 2:
            first_para = '. '.join(sentences[:2]) + '.'
        return first_para[:max_length]
    return "[Document summarized]"


def summarize_general(content: str, max_length: int = 500) -> str:
    """General purpose summarization."""
    return content[:max_length] + "..." if len(content) > max_length else content


# Observation Masking

class ObservationStore:
    def __init__(self, max_size=1000):
        self.observations = {}
        self.order = []
        self.max_size = max_size
    
    def store(self, content: str, metadata: dict = None) -> str:
        """Store observation and return reference ID."""
        ref_id = self._generate_ref_id(content)
        
        self.observations[ref_id] = {
            "content": content,
            "metadata": metadata or {},
            "stored_at": time.time(),
            "last_accessed": time.time()
        }
        self.order.append(ref_id)
        
        # Evict oldest if over limit
        if len(self.order) > self.max_size:
            oldest = self.order.pop(0)
            del self.observations[oldest]
        
        return ref_id
    
    def retrieve(self, ref_id: str) -> str:
        """Retrieve observation by reference ID."""
        if ref_id in self.observations:
            self.observations[ref_id]["last_accessed"] = time.time()
            return self.observations[ref_id]["content"]
        return None
    
    def mask(self, content: str, max_length: int = 200) -> tuple:
        """
        Mask observation if longer than max_length.
        
        Returns (masked_content, stored_ref_id_or_None).
        """
        if len(content) <= max_length:
            return content, None
        
        ref_id = self.store(content)
        
        # Extract key point for reference
        key_point = self._extract_key_point(content)
        
        masked = f"[Obs:{ref_id} elided. Key: {key_point}. Full content retrievable.]"
        return masked, ref_id
    
    def _generate_ref_id(self, content: str) -> str:
        """Generate unique reference ID."""
        hash_input = f"{content[:100]}{time.time()}"
        return hashlib.md5(hash_input.encode()).hexdigest()[:8]
    
    def _extract_key_point(self, content: str) -> str:
        """Extract key point from observation."""
        # First substantial line or sentence
        lines = [l for l in content.split('\n') if len(l) > 20]
        if lines:
            return lines[0][:50] + "..."
        sentences = content.split('. ')
        if sentences:
            return sentences[0][:50] + "..."
        return content[:50] + "..."


# Context Budget Management

class ContextBudget:
    def __init__(self, total_limit: int):
        self.total_limit = total_limit
        self.allocated = {
            "system_prompt": 0,
            "tool_definitions": 0,
            "retrieved_docs": 0,
            "message_history": 0,
            "tool_outputs": 0,
            "other": 0
        }
        self.reserved = 5000  # Reserved buffer
        self.reservation_limit = total_limit - self.reserved
    
    def allocate(self, category: str, amount: int) -> bool:
        """Allocate budget to category. Returns success status."""
        if category not in self.allocated:
            category = "other"
        
        current = sum(self.allocated.values())
        proposed = current + amount
        
        if proposed > self.reservation_limit:
            return False
        
        self.allocated[category] += amount
        return True
    
    def remaining(self) -> int:
        """Get remaining unallocated budget."""
        current = sum(self.allocated.values())
        return self.reservation_limit - current
    
    def get_usage(self) -> dict:
        """Get current usage breakdown."""
        total = sum(self.allocated.values())
        return {
            "total_used": total,
            "total_limit": self.total_limit,
            "remaining": self.remaining(),
            "by_category": dict(self.allocated),
            "utilization_ratio": total / self.total_limit
        }
    
    def should_optimize(self, current_usage: int, metrics: dict = None) -> tuple:
        """
        Determine if optimization should trigger.
        
        Returns (should_optimize, reasons).
        """
        reasons = []
        
        # Check utilization
        utilization = current_usage / self.total_limit
        if utilization > 0.8:
            reasons.append(("high_utilization", utilization))
        
        # Check degradation metrics if provided
        if metrics:
            if metrics.get("attention_degradation", 0) > 0.3:
                reasons.append(("attention_degradation", True))
            
            if metrics.get("quality_score", 1.0) < 0.8:
                reasons.append(("quality_degradation", True))
        
        should_optimize = len(reasons) > 0
        return should_optimize, reasons


# Cache Optimization

def design_stable_prompt(template: str, dynamic_values: dict) -> str:
    """
    Design prompt to maximize KV-cache stability.
    
    Replaces dynamic values with stable placeholders.
    """
    result = template
    
    # Replace timestamps
    import re
    date_pattern = r'\d{4}-\d{2}-\d{2}'
    result = re.sub(date_pattern, '[DATE_STABLE]', result)
    
    # Replace session IDs
    session_pattern = r'Session \d+'
    result = re.sub(session_pattern, 'Session [STABLE]', result)
    
    # Replace counters
    counter_pattern = r'\d+/\d+'
    result = re.sub(counter_pattern, '[COUNTER_STABLE]', result)
    
    return result


def calculate_cache_metrics(requests: list, cache: dict) -> dict:
    """
    Calculate KV-cache hit metrics for request sequence.
    """
    hits = 0
    misses = 0
    
    for req in requests:
        prefix = req.get("prefix_hash", "")
        token_count = req.get("token_count", 0)
        
        if prefix in cache:
            hits += token_count * cache[prefix].get("hit_ratio", 0)
        else:
            misses += token_count
    
    total = hits + misses
    
    return {
        "hit_rate": hits / total if total > 0 else 0,
        "cache_hits": hits,
        "cache_misses": misses,
        "recommendations": generate_cache_recommendations(hits, misses)
    }


def generate_cache_recommendations(hits: int, misses: int) -> list:
    """Generate recommendations for cache optimization."""
    recommendations = []
    
    hit_rate = hits / (hits + misses) if (hits + misses) > 0 else 0
    
    if hit_rate < 0.5:
        recommendations.append("Consider stabilizing system prompts")
        recommendations.append("Reduce variation in request prefixes")
    
    if hit_rate < 0.8:
        recommendations.append("Group similar requests together")
        recommendations.append("Use consistent formatting across requests")
    
    return recommendations
