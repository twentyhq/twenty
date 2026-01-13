"""
Context Degradation Detection

This module provides utilities for detecting and measuring context degradation patterns.

PRODUCTION NOTES:
- The attention estimation functions in this module simulate U-shaped attention curves
  for demonstration purposes. Production systems should extract actual attention weights
  from model internals when available.
- Token estimation uses simplified heuristics (~4 chars/token). Production systems
  should use model-specific tokenizers for accurate counts.
- The poisoning and hallucination detection uses pattern matching as a proxy.
  Production systems may benefit from fine-tuned classifiers or model-based detection.
"""

import numpy as np
from typing import List, Dict
import re


def measure_attention_distribution(context_tokens: List[str], query: str) -> List[Dict]:
    """
    Measure how attention varies across context positions.
    
    Returns distribution showing attention weight by position.
    """
    n = len(context_tokens)
    attention_by_position = []
    
    for position in range(n):
        is_beginning = position < n * 0.1
        is_end = position > n * 0.9
        
        # Simulated attention measurement
        # In production, this would use actual model attention weights
        attention = _estimate_attention(position, n, is_beginning, is_end)
        
        attention_by_position.append({
            "position": position,
            "attention": attention,
            "region": "attention_favored" if (is_beginning or is_end) else "attention_degraded",
            "tokens": context_tokens[position][:50] if position < 5 or position > n - 5 else None
        })
    
    return attention_by_position


def _estimate_attention(position: int, total: int, is_beginning: bool, is_end: bool) -> float:
    """
    Estimate attention weight for position.
    
    Simulates U-shaped attention curve based on research findings.
    
    IMPORTANT: This is a simulation for demonstration purposes.
    Production systems should:
    1. Extract actual attention weights from model forward passes
    2. Use model-specific attention analysis tools
    3. Consider using interpretability libraries (e.g., TransformerLens)
    
    The simulated curve reflects research findings:
    - Beginning tokens receive high attention (primacy effect)
    - End tokens receive high attention (recency effect)
    - Middle tokens receive degraded attention (lost-in-middle)
    """
    if is_beginning:
        return 0.8 + np.random.random() * 0.2
    elif is_end:
        return 0.7 + np.random.random() * 0.3
    else:
        # Middle positions get reduced attention
        middle_progress = (position - total * 0.1) / (total * 0.8)
        base_attention = 0.3 * (1 - middle_progress) + 0.1 * middle_progress
        return base_attention + np.random.random() * 0.1


# Lost-in-Middle Detection

def detect_lost_in_middle(critical_positions: List[int], 
                          attention_distribution: List[Dict]) -> Dict:
    """
    Check if critical information is in attention-degraded positions.
    
    Returns detection results and recommendations.
    """
    results = {
        "at_risk": [],
        "safe": [],
        "recommendations": [],
        "degradation_score": 0.0
    }
    
    at_risk_count = 0
    total_critical = len(critical_positions)
    
    for pos in critical_positions:
        if pos < len(attention_distribution):
            region = attention_distribution[pos]["region"]
            if region == "attention_degraded":
                results["at_risk"].append(pos)
                at_risk_count += 1
            else:
                results["safe"].append(pos)
    
    # Calculate degradation score
    if total_critical > 0:
        results["degradation_score"] = at_risk_count / total_critical
    
    # Generate recommendations
    if results["at_risk"]:
        results["recommendations"].extend([
            "Move critical information to attention-favored positions",
            "Use explicit markers to highlight critical information",
            "Consider splitting context to reduce middle section",
            f"{at_risk_count}/{total_critical} critical items are in degraded region"
        ])
    
    return results


def analyze_context_structure(context: str) -> Dict:
    """
    Analyze context structure for degradation risk factors.
    """
    lines = context.split('\n')
    sections = []
    
    current_section = {"start": 0, "type": "unknown", "length": 0}
    
    for i, line in enumerate(lines):
        # Detect section headers
        if line.startswith('#'):
            if current_section["length"] > 0:
                sections.append(current_section)
            current_section = {
                "start": i,
                "type": "header",
                "length": 1,
                "header": line.lstrip('#').strip()
            }
        else:
            current_section["length"] += 1
    
    sections.append(current_section)
    
    # Analyze section distribution
    n = len(lines)
    middle_start = int(n * 0.3)
    middle_end = int(n * 0.7)
    
    middle_content = sum(
        s["length"] for s in sections 
        if s["start"] >= middle_start and s["start"] <= middle_end
    )
    
    return {
        "total_lines": n,
        "sections": sections,
        "middle_content_ratio": middle_content / n if n > 0 else 0,
        "degradation_risk": "high" if middle_content / n > 0.5 else "medium" if middle_content / n > 0.3 else "low"
    }


# Context Poisoning Detection

class PoisoningDetector:
    def __init__(self):
        self.claims = []
        self.error_patterns = [
            r"error",
            r"failed",
            r"exception",
            r"cannot",
            r"unable",
            r"invalid",
            r"not found"
        ]
    
    def extract_claims(self, text: str) -> List[Dict]:
        """Extract claims from text for verification tracking."""
        # Simple claim extraction - in production use NER and fact extraction
        sentences = text.split('.')
        claims = []
        
        for i, sentence in enumerate(sentences):
            sentence = sentence.strip()
            if len(sentence) < 10:
                continue
            
            claims.append({
                "id": i,
                "text": sentence,
                "verified": None,
                "has_error_indicator": any(
                    re.search(pattern, sentence, re.IGNORECASE) 
                    for pattern in self.error_patterns
                )
            })
        
        self.claims.extend(claims)
        return claims
    
    def detect_poisoning(self, context: str) -> Dict:
        """
        Detect potential context poisoning indicators.
        """
        indicators = []
        
        # Check for error accumulation
        error_count = sum(
            1 for pattern in self.error_patterns 
            if re.search(pattern, context, re.IGNORECASE)
        )
        
        if error_count > 3:
            indicators.append({
                "type": "error_accumulation",
                "count": error_count,
                "severity": "high" if error_count > 5 else "medium",
                "message": f"Found {error_count} error indicators in context"
            })
        
        # Check for contradiction patterns
        contradictions = self._detect_contradictions(context)
        if contradictions:
            indicators.append({
                "type": "contradictions",
                "count": len(contradictions),
                "examples": contradictions[:3],
                "severity": "high",
                "message": f"Found {len(contradictions)} potential contradictions"
            })
        
        # Check for hallucination markers
        hallucination_markers = self._detect_hallucination_markers(context)
        if hallucination_markers:
            indicators.append({
                "type": "hallucination_markers",
                "count": len(hallucination_markers),
                "severity": "medium",
                "message": f"Found {len(hallucination_markers)} phrases associated with uncertain claims"
            })
        
        return {
            "poisoning_risk": len(indicators) > 0,
            "indicators": indicators,
            "overall_risk": "high" if len(indicators) > 2 else "medium" if len(indicators) > 0 else "low"
        }
    
    def _detect_contradictions(self, text: str) -> List[str]:
        """Detect potential contradictions in text."""
        contradictions = []
        
        # Look for conflict markers
        conflict_patterns = [
            (r"however", r"but"),
            (r"on the other hand", r"instead"),
            (r"although", r"yet"),
            (r"despite", r"nevertheless")
        ]
        
        for pattern1, pattern2 in conflict_patterns:
            if re.search(pattern1, text, re.IGNORECASE) and re.search(pattern2, text, re.IGNORECASE):
                # Find sentences containing these patterns
                sentences = text.split('.')
                for sentence in sentences:
                    if re.search(pattern1, sentence, re.IGNORECASE) or \
                       re.search(pattern2, sentence, re.IGNORECASE):
                        if sentence.strip() and len(sentence.strip()) < 200:
                            contradictions.append(sentence.strip()[:100])
        
        return contradictions[:5]
    
    def _detect_hallucination_markers(self, text: str) -> List[str]:
        """Detect phrases associated with uncertain or hallucinated claims."""
        markers = [
            "may have been",
            "might have",
            "could potentially",
            "possibly",
            "apparently",
            "reportedly",
            "it is said that",
            "sources suggest",
            "believed to be",
            "thought to be"
        ]
        
        found = []
        for marker in markers:
            if marker in text.lower():
                found.append(marker)
        
        return found


# Context Health Score

class ContextHealthAnalyzer:
    def __init__(self, context_limit: int = 100000):
        self.context_limit = context_limit
        self.metrics_history = []
    
    def analyze(self, context: str, critical_positions: List[int] = None) -> Dict:
        """
        Perform comprehensive context health analysis.
        """
        tokens = context.split()
        
        # Basic metrics
        token_count = len(tokens)
        utilization = token_count / self.context_limit
        
        # Attention analysis
        attention_dist = measure_attention_distribution(
            tokens[:1000],  # Sample for efficiency
            "current_task"
        )
        
        degradation = detect_lost_in_middle(
            critical_positions or list(range(10)),
            attention_dist
        )
        
        # Poisoning check
        poisoning = PoisoningDetector().detect_poisoning(context)
        
        # Calculate health score
        health_score = self._calculate_health_score(
            utilization=utilization,
            degradation=degradation["degradation_score"],
            poisoning_risk=1.0 if poisoning["poisoning_risk"] else 0.0
        )
        
        result = {
            "health_score": health_score,
            "status": self._interpret_score(health_score),
            "metrics": {
                "token_count": token_count,
                "utilization": utilization,
                "degradation_score": degradation["degradation_score"],
                "poisoning_risk": poisoning["overall_risk"]
            },
            "issues": {
                "lost_in_middle": degradation,
                "poisoning": poisoning
            },
            "recommendations": self._generate_recommendations(
                utilization, degradation, poisoning
            )
        }
        
        self.metrics_history.append(result)
        return result
    
    def _calculate_health_score(self, utilization: float, 
                                 degradation: float, 
                                 poisoning_risk: float) -> float:
        """Calculate composite health score."""
        # Weighted combination
        utilization_penalty = min(utilization * 0.5, 0.3)
        degradation_penalty = degradation * 0.3
        poisoning_penalty = poisoning_risk * 0.2
        
        score = 1.0 - utilization_penalty - degradation_penalty - poisoning_penalty
        return max(0.0, min(1.0, score))
    
    def _interpret_score(self, score: float) -> str:
        """Interpret health score."""
        if score > 0.8:
            return "healthy"
        elif score > 0.6:
            return "warning"
        elif score > 0.4:
            return "degraded"
        else:
            return "critical"
    
    def _generate_recommendations(self, utilization: float, 
                                   degradation: Dict,
                                   poisoning: Dict) -> List[str]:
        """Generate recommendations based on analysis."""
        recommendations = []
        
        if utilization > 0.8:
            recommendations.append("Context near limit - consider compaction")
            recommendations.append("Implement observation masking for tool outputs")
        
        if degradation.get("at_risk"):
            recommendations.append("Critical information in degraded attention region")
            recommendations.append("Move key information to beginning or end of context")
        
        if poisoning["poisoning_risk"]:
            recommendations.append("Context poisoning indicators detected")
            recommendations.append("Review and remove potentially erroneous information")
        
        if not recommendations:
            recommendations.append("Context appears healthy - continue monitoring")
        
        return recommendations


# Usage Example

def analyze_agent_context(context: str) -> Dict:
    """Analyze context for an agent session."""
    analyzer = ContextHealthAnalyzer(context_limit=80000)
    
    # Define critical positions (e.g., goals, constraints)
    critical_positions = list(range(5))  # First 5 items are critical
    
    result = analyzer.analyze(context, critical_positions)
    
    print(f"Health Score: {result['health_score']:.2f}")
    print(f"Status: {result['status']}")
    print(f"Recommendations:")
    for rec in result["recommendations"]:
        print(f"  - {rec}")
    
    return result
