"""
Context Compression Evaluation

This module provides utilities for evaluating context compression quality
using probe-based assessment.

PRODUCTION NOTES:
- The LLM judge calls are stubbed for demonstration. Production systems
  should implement actual API calls to GPT-5.2 or equivalent.
- Token estimation uses simplified heuristics. Production systems should
  use model-specific tokenizers.
- Ground truth extraction uses pattern matching. Production systems may
  benefit from more sophisticated fact extraction.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum
import json
import re


class ProbeType(Enum):
    RECALL = "recall"
    ARTIFACT = "artifact"
    CONTINUATION = "continuation"
    DECISION = "decision"


@dataclass
class Probe:
    """A probe question for evaluating compression quality."""
    probe_type: ProbeType
    question: str
    ground_truth: Optional[str] = None
    context_reference: Optional[str] = None


@dataclass
class CriterionResult:
    """Result for a single evaluation criterion."""
    criterion_id: str
    score: float
    reasoning: str


@dataclass
class EvaluationResult:
    """Complete evaluation result for a probe response."""
    probe: Probe
    response: str
    criterion_results: List[CriterionResult]
    aggregate_score: float
    dimension_scores: Dict[str, float] = field(default_factory=dict)


# Evaluation Rubrics

RUBRIC_CRITERIA = {
    "accuracy": [
        {
            "id": "accuracy_factual",
            "question": "Are facts, file paths, and technical details correct?",
            "weight": 0.6
        },
        {
            "id": "accuracy_technical", 
            "question": "Are code references and technical concepts correct?",
            "weight": 0.4
        }
    ],
    "context_awareness": [
        {
            "id": "context_conversation_state",
            "question": "Does the response reflect current conversation state?",
            "weight": 0.5
        },
        {
            "id": "context_artifact_state",
            "question": "Does the response reflect which files/artifacts were accessed?",
            "weight": 0.5
        }
    ],
    "artifact_trail": [
        {
            "id": "artifact_files_created",
            "question": "Does the agent know which files were created?",
            "weight": 0.3
        },
        {
            "id": "artifact_files_modified",
            "question": "Does the agent know which files were modified?",
            "weight": 0.4
        },
        {
            "id": "artifact_key_details",
            "question": "Does the agent remember function names, variable names, error messages?",
            "weight": 0.3
        }
    ],
    "completeness": [
        {
            "id": "completeness_coverage",
            "question": "Does the response address all parts of the question?",
            "weight": 0.6
        },
        {
            "id": "completeness_depth",
            "question": "Is sufficient detail provided?",
            "weight": 0.4
        }
    ],
    "continuity": [
        {
            "id": "continuity_work_state",
            "question": "Can the agent continue without re-fetching information?",
            "weight": 0.4
        },
        {
            "id": "continuity_todo_state",
            "question": "Does the agent maintain awareness of pending tasks?",
            "weight": 0.3
        },
        {
            "id": "continuity_reasoning",
            "question": "Does the agent retain rationale behind previous decisions?",
            "weight": 0.3
        }
    ],
    "instruction_following": [
        {
            "id": "instruction_format",
            "question": "Does the response follow the requested format?",
            "weight": 0.5
        },
        {
            "id": "instruction_constraints",
            "question": "Does the response respect stated constraints?",
            "weight": 0.5
        }
    ]
}


class ProbeGenerator:
    """Generate probes from conversation history."""
    
    def __init__(self, conversation_history: str):
        self.history = conversation_history
        self.extracted_facts = self._extract_facts()
        self.extracted_files = self._extract_files()
        self.extracted_decisions = self._extract_decisions()
    
    def generate_probes(self) -> List[Probe]:
        """Generate all probe types for evaluation."""
        probes = []
        
        # Recall probes
        if self.extracted_facts:
            probes.append(Probe(
                probe_type=ProbeType.RECALL,
                question="What was the original error or issue that started this session?",
                ground_truth=self.extracted_facts.get("original_error"),
                context_reference="session_start"
            ))
        
        # Artifact probes
        if self.extracted_files:
            probes.append(Probe(
                probe_type=ProbeType.ARTIFACT,
                question="Which files have we modified? Describe what changed in each.",
                ground_truth=json.dumps(self.extracted_files),
                context_reference="file_operations"
            ))
        
        # Continuation probes
        probes.append(Probe(
            probe_type=ProbeType.CONTINUATION,
            question="What should we do next?",
            ground_truth=self.extracted_facts.get("next_steps"),
            context_reference="task_state"
        ))
        
        # Decision probes
        if self.extracted_decisions:
            probes.append(Probe(
                probe_type=ProbeType.DECISION,
                question="What key decisions did we make and why?",
                ground_truth=json.dumps(self.extracted_decisions),
                context_reference="decision_points"
            ))
        
        return probes
    
    def _extract_facts(self) -> Dict[str, str]:
        """Extract factual claims from history."""
        facts = {}
        
        # Extract error patterns
        error_patterns = [
            r"error[:\s]+(.+?)(?:\n|$)",
            r"(\d{3})\s+(Unauthorized|Not Found|Internal Server Error)",
            r"exception[:\s]+(.+?)(?:\n|$)"
        ]
        
        for pattern in error_patterns:
            match = re.search(pattern, self.history, re.IGNORECASE)
            if match:
                facts["original_error"] = match.group(0).strip()
                break
        
        # Extract next steps
        next_step_patterns = [
            r"next[:\s]+(.+?)(?:\n|$)",
            r"TODO[:\s]+(.+?)(?:\n|$)",
            r"remaining[:\s]+(.+?)(?:\n|$)"
        ]
        
        for pattern in next_step_patterns:
            match = re.search(pattern, self.history, re.IGNORECASE)
            if match:
                facts["next_steps"] = match.group(0).strip()
                break
        
        return facts
    
    def _extract_files(self) -> List[Dict[str, str]]:
        """Extract file operations from history."""
        files = []
        
        # Common file patterns
        file_patterns = [
            r"(?:modified|changed|updated|edited)\s+([^\s]+\.[a-z]+)",
            r"(?:created|added)\s+([^\s]+\.[a-z]+)",
            r"(?:read|examined|opened)\s+([^\s]+\.[a-z]+)"
        ]
        
        for pattern in file_patterns:
            matches = re.findall(pattern, self.history, re.IGNORECASE)
            for match in matches:
                if match not in [f["path"] for f in files]:
                    files.append({
                        "path": match,
                        "operation": "modified" if "modif" in pattern else "created" if "creat" in pattern else "read"
                    })
        
        return files
    
    def _extract_decisions(self) -> List[Dict[str, str]]:
        """Extract decision points from history."""
        decisions = []
        
        decision_patterns = [
            r"decided to\s+(.+?)(?:\n|$)",
            r"chose\s+(.+?)(?:\n|$)",
            r"going with\s+(.+?)(?:\n|$)",
            r"will use\s+(.+?)(?:\n|$)"
        ]
        
        for pattern in decision_patterns:
            matches = re.findall(pattern, self.history, re.IGNORECASE)
            for match in matches:
                decisions.append({
                    "decision": match.strip(),
                    "context": pattern.split("\\s+")[0]
                })
        
        return decisions[:5]  # Limit to 5 decisions


class CompressionEvaluator:
    """Evaluate compression quality using probes and LLM judge."""
    
    def __init__(self, model: str = "gpt-5.2"):
        self.model = model
        self.results: List[EvaluationResult] = []
    
    def evaluate(self, 
                 probe: Probe, 
                 response: str, 
                 compressed_context: str) -> EvaluationResult:
        """
        Evaluate a single probe response.
        
        Args:
            probe: The probe question
            response: The model's response to evaluate
            compressed_context: The compressed context that was provided
            
        Returns:
            EvaluationResult with scores and reasoning
        """
        # Get relevant criteria based on probe type
        criteria = self._get_criteria_for_probe(probe.probe_type)
        
        # Evaluate each criterion
        criterion_results = []
        for criterion in criteria:
            result = self._evaluate_criterion(
                criterion, 
                probe, 
                response, 
                compressed_context
            )
            criterion_results.append(result)
        
        # Calculate dimension scores
        dimension_scores = self._calculate_dimension_scores(criterion_results)
        
        # Calculate aggregate score
        aggregate_score = sum(dimension_scores.values()) / len(dimension_scores)
        
        result = EvaluationResult(
            probe=probe,
            response=response,
            criterion_results=criterion_results,
            aggregate_score=aggregate_score,
            dimension_scores=dimension_scores
        )
        
        self.results.append(result)
        return result
    
    def _get_criteria_for_probe(self, probe_type: ProbeType) -> List[Dict]:
        """Get relevant criteria for probe type."""
        criteria = []
        
        # All probes get accuracy and completeness
        criteria.extend(RUBRIC_CRITERIA["accuracy"])
        criteria.extend(RUBRIC_CRITERIA["completeness"])
        
        # Add type-specific criteria
        if probe_type == ProbeType.ARTIFACT:
            criteria.extend(RUBRIC_CRITERIA["artifact_trail"])
        elif probe_type == ProbeType.CONTINUATION:
            criteria.extend(RUBRIC_CRITERIA["continuity"])
        elif probe_type == ProbeType.RECALL:
            criteria.extend(RUBRIC_CRITERIA["context_awareness"])
        elif probe_type == ProbeType.DECISION:
            criteria.extend(RUBRIC_CRITERIA["context_awareness"])
            criteria.extend(RUBRIC_CRITERIA["continuity"])
        
        criteria.extend(RUBRIC_CRITERIA["instruction_following"])
        
        return criteria
    
    def _evaluate_criterion(self,
                           criterion: Dict,
                           probe: Probe,
                           response: str,
                           context: str) -> CriterionResult:
        """
        Evaluate a single criterion using LLM judge.
        
        PRODUCTION NOTE: This is a stub implementation.
        Production systems should call the actual LLM API:
        
        ```python
        result = openai.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {"role": "system", "content": JUDGE_SYSTEM_PROMPT},
                {"role": "user", "content": self._format_judge_input(criterion, probe, response, context)}
            ]
        )
        return self._parse_judge_output(result)
        ```
        """
        # Stub implementation - in production, call LLM judge
        score = self._heuristic_score(criterion, response, probe.ground_truth)
        reasoning = f"Evaluated {criterion['id']} based on response content."
        
        return CriterionResult(
            criterion_id=criterion["id"],
            score=score,
            reasoning=reasoning
        )
    
    def _heuristic_score(self, 
                         criterion: Dict, 
                         response: str, 
                         ground_truth: Optional[str]) -> float:
        """
        Heuristic scoring for demonstration.
        
        Production systems should use LLM judge instead.
        """
        score = 3.0  # Base score
        
        # Adjust based on response length and content
        if len(response) < 50:
            score -= 1.0  # Too short
        elif len(response) > 500:
            score += 0.5  # Detailed
        
        # Check for technical content
        if any(ext in response for ext in [".ts", ".py", ".js", ".md"]):
            score += 0.5  # Contains file references
        
        if ground_truth and ground_truth in response:
            score += 1.0  # Contains ground truth
        
        return min(5.0, max(0.0, score))
    
    def _calculate_dimension_scores(self, 
                                    criterion_results: List[CriterionResult]) -> Dict[str, float]:
        """Calculate dimension scores from criterion results."""
        dimension_scores = {}
        
        for dimension, criteria in RUBRIC_CRITERIA.items():
            criterion_ids = [c["id"] for c in criteria]
            relevant_results = [
                r for r in criterion_results 
                if r.criterion_id in criterion_ids
            ]
            
            if relevant_results:
                # Weighted average
                total_weight = sum(
                    c["weight"] for c in criteria 
                    if c["id"] in [r.criterion_id for r in relevant_results]
                )
                weighted_sum = sum(
                    r.score * next(c["weight"] for c in criteria if c["id"] == r.criterion_id)
                    for r in relevant_results
                )
                dimension_scores[dimension] = weighted_sum / total_weight if total_weight > 0 else 0.0
        
        return dimension_scores
    
    def get_summary(self) -> Dict:
        """Get summary of all evaluation results."""
        if not self.results:
            return {"error": "No evaluations performed"}
        
        avg_score = sum(r.aggregate_score for r in self.results) / len(self.results)
        
        # Average dimension scores
        dimension_totals = {}
        dimension_counts = {}
        
        for result in self.results:
            for dim, score in result.dimension_scores.items():
                dimension_totals[dim] = dimension_totals.get(dim, 0) + score
                dimension_counts[dim] = dimension_counts.get(dim, 0) + 1
        
        avg_dimensions = {
            dim: dimension_totals[dim] / dimension_counts[dim]
            for dim in dimension_totals
        }
        
        return {
            "total_evaluations": len(self.results),
            "average_score": avg_score,
            "dimension_averages": avg_dimensions,
            "weakest_dimension": min(avg_dimensions, key=avg_dimensions.get),
            "strongest_dimension": max(avg_dimensions, key=avg_dimensions.get)
        }


class StructuredSummarizer:
    """Generate structured summaries with explicit sections."""
    
    TEMPLATE = """## Session Intent
{intent}

## Files Modified
{files_modified}

## Files Read (Not Modified)
{files_read}

## Decisions Made
{decisions}

## Current State
{current_state}

## Next Steps
{next_steps}
"""
    
    def __init__(self):
        self.sections = {
            "intent": "",
            "files_modified": [],
            "files_read": [],
            "decisions": [],
            "current_state": "",
            "next_steps": []
        }
    
    def update_from_span(self, new_content: str) -> str:
        """
        Update summary from newly truncated content span.
        
        This implements anchored iterative summarization:
        - Extract information from new span
        - Merge with existing sections
        - Return updated summary
        """
        # Extract information from new content
        new_info = self._extract_from_content(new_content)
        
        # Merge with existing sections
        self._merge_sections(new_info)
        
        # Generate formatted summary
        return self._format_summary()
    
    def _extract_from_content(self, content: str) -> Dict:
        """Extract structured information from content."""
        extracted = {
            "intent": "",
            "files_modified": [],
            "files_read": [],
            "decisions": [],
            "current_state": "",
            "next_steps": []
        }
        
        # Extract file modifications
        mod_pattern = r"(?:modified|changed|updated|fixed)\s+([^\s]+\.[a-z]+)[:\s]*(.+?)(?:\n|$)"
        for match in re.finditer(mod_pattern, content, re.IGNORECASE):
            extracted["files_modified"].append({
                "path": match.group(1),
                "change": match.group(2).strip()[:100]
            })
        
        # Extract file reads
        read_pattern = r"(?:read|examined|opened|checked)\s+([^\s]+\.[a-z]+)"
        for match in re.finditer(read_pattern, content, re.IGNORECASE):
            file_path = match.group(1)
            if file_path not in [f["path"] for f in extracted["files_modified"]]:
                extracted["files_read"].append(file_path)
        
        # Extract decisions
        decision_pattern = r"(?:decided|chose|going with|will use)\s+(.+?)(?:\n|$)"
        for match in re.finditer(decision_pattern, content, re.IGNORECASE):
            extracted["decisions"].append(match.group(1).strip()[:150])
        
        return extracted
    
    def _merge_sections(self, new_info: Dict):
        """Merge new information with existing sections."""
        # Update intent if empty
        if new_info["intent"] and not self.sections["intent"]:
            self.sections["intent"] = new_info["intent"]
        
        # Merge file lists (deduplicate by path)
        existing_mod_paths = [f["path"] for f in self.sections["files_modified"]]
        for file_info in new_info["files_modified"]:
            if file_info["path"] not in existing_mod_paths:
                self.sections["files_modified"].append(file_info)
        
        # Merge read files
        for file_path in new_info["files_read"]:
            if file_path not in self.sections["files_read"]:
                self.sections["files_read"].append(file_path)
        
        # Append decisions
        self.sections["decisions"].extend(new_info["decisions"])
        
        # Update current state (latest wins)
        if new_info["current_state"]:
            self.sections["current_state"] = new_info["current_state"]
        
        # Merge next steps
        self.sections["next_steps"].extend(new_info["next_steps"])
    
    def _format_summary(self) -> str:
        """Format sections into summary string."""
        files_modified_str = "\n".join(
            f"- {f['path']}: {f['change']}" 
            for f in self.sections["files_modified"]
        ) or "None"
        
        files_read_str = "\n".join(
            f"- {f}" for f in self.sections["files_read"]
        ) or "None"
        
        decisions_str = "\n".join(
            f"- {d}" for d in self.sections["decisions"][-5:]  # Keep last 5
        ) or "None"
        
        next_steps_str = "\n".join(
            f"{i+1}. {s}" for i, s in enumerate(self.sections["next_steps"][-5:])
        ) or "None"
        
        return self.TEMPLATE.format(
            intent=self.sections["intent"] or "Not specified",
            files_modified=files_modified_str,
            files_read=files_read_str,
            decisions=decisions_str,
            current_state=self.sections["current_state"] or "In progress",
            next_steps=next_steps_str
        )


# Usage Example

def evaluate_compression_quality(
    original_history: str,
    compressed_context: str,
    model_response_fn
) -> Dict:
    """
    Evaluate compression quality for a conversation.
    
    Args:
        original_history: The full conversation before compression
        compressed_context: The compressed version
        model_response_fn: Function to get model responses given compressed context
        
    Returns:
        Evaluation summary with scores and recommendations
    """
    # Generate probes
    generator = ProbeGenerator(original_history)
    probes = generator.generate_probes()
    
    # Evaluate each probe
    evaluator = CompressionEvaluator()
    
    for probe in probes:
        # Get model response using compressed context
        response = model_response_fn(compressed_context, probe.question)
        
        # Evaluate response
        evaluator.evaluate(probe, response, compressed_context)
    
    # Get summary
    summary = evaluator.get_summary()
    
    # Add recommendations
    summary["recommendations"] = []
    
    if summary.get("weakest_dimension") == "artifact_trail":
        summary["recommendations"].append(
            "Consider implementing separate artifact tracking outside compression"
        )
    
    if summary["average_score"] < 3.5:
        summary["recommendations"].append(
            "Compression quality is below threshold - consider less aggressive compression"
        )
    
    return summary










