"""
Agent Evaluation Framework

This module provides utilities for evaluating agent systems.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import time


class ScoreLevel(Enum):
    EXCELLENT = 1.0
    GOOD = 0.8
    ACCEPTABLE = 0.6
    POOR = 0.3
    FAILED = 0.0


@dataclass
class RubricDimension:
    """Definition of an evaluation dimension."""
    name: str
    weight: float
    description: str
    levels: Dict[str, str]  # level_name -> description


DEFAULT_RUBRIC = {
    "factual_accuracy": RubricDimension(
        name="factual_accuracy",
        weight=0.30,
        description="Claims in output match ground truth",
        levels={
            "excellent": "All claims verified, no errors",
            "good": "Minor errors not affecting main conclusions",
            "acceptable": "Major claims correct, minor inaccuracies",
            "poor": "Significant factual errors",
            "failed": "Fundamental factual errors"
        }
    ),
    "completeness": RubricDimension(
        name="completeness",
        weight=0.25,
        description="Output covers all requested aspects",
        levels={
            "excellent": "All aspects thoroughly covered",
            "good": "Most aspects covered, minor gaps",
            "acceptable": "Key aspects covered, some gaps",
            "poor": "Major aspects missing",
            "failed": "Fundamental aspects missing"
        }
    ),
    "citation_accuracy": RubricDimension(
        name="citation_accuracy",
        weight=0.15,
        description="Citations match claimed sources",
        levels={
            "excellent": "All citations accurate and complete",
            "good": "Minor citation issues",
            "acceptable": "Major citations accurate",
            "poor": "Significant citation problems",
            "failed": "Citations missing or incorrect"
        }
    ),
    "source_quality": RubricDimension(
        name="source_quality",
        weight=0.10,
        description="",
        levels={
            "excellent": "Primary sourcesUses appropriate primary sources, authoritative",
            "good": "Mostly primary, some secondary",
            "acceptable": "Mix of primary and secondary",
            "poor": "Mostly secondary or unreliable",
            "failed": "No credible sources"
        }
    ),
    "tool_efficiency": RubricDimension(
        name="tool_efficiency",
        weight=0.20,
        description="Uses right tools reasonable number of times",
        levels={
            "excellent": "Optimal tool selection and count",
            "good": "Good tool selection, minor inefficiencies",
            "acceptable": "Appropriate tools, some redundancy",
            "poor": "Wrong tools or excessive calls",
            "failed": "Severe tool misuse"
        }
    )
}


# Evaluation Engine

class AgentEvaluator:
    """Main evaluation engine for agent outputs."""
    
    def __init__(self, rubric: Dict[str, RubricDimension] = None):
        self.rubric = rubric or DEFAULT_RUBRIC
        self.evaluation_history: List[Dict] = []
    
    def evaluate(self, task: Dict, output: str, 
                 ground_truth: Dict = None,
                 tool_calls: List[Dict] = None) -> Dict:
        """
        Evaluate agent output against task requirements.
        
        Returns evaluation results with per-dimension scores.
        """
        scores = {}
        
        for dimension_name, dimension in self.rubric.items():
            # In production, use LLM or human evaluation
            # Here we simulate with heuristics
            score = self._evaluate_dimension(
                dimension=dimension,
                task=task,
                output=output,
                ground_truth=ground_truth,
                tool_calls=tool_calls
            )
            
            scores[dimension_name] = {
                "score": score,
                "weight": dimension.weight,
                "level": self._score_to_level(score)
            }
        
        # Calculate weighted overall
        overall = sum(
            s["score"] * self.rubric[k]["weight"]
            for k, s in scores.items()
        )
        
        result = {
            "overall_score": overall,
            "dimension_scores": scores,
            "passed": overall >= 0.7,
            "timestamp": time.time()
        }
        
        self.evaluation_history.append(result)
        return result
    
    def _evaluate_dimension(self, dimension: RubricDimension,
                            task: Dict, output: str,
                            ground_truth: Dict = None,
                            tool_calls: List[Dict] = None) -> float:
        """
        Evaluate a single dimension.
        
        In production, this would use LLM judgment or human evaluation.
        """
        # Simple heuristics for demonstration
        # Real implementation would use actual evaluation logic
        
        output_lower = output.lower()
        task_type = task.get("type", "")
        
        if dimension.name == "factual_accuracy":
            # Check for factual markers
            if ground_truth:
                return self._check_factual_accuracy(output, ground_truth)
            return 0.7  # Default assumption
        
        elif dimension.name == "completeness":
            # Check if task requirements are met
            required = task.get("requirements", [])
            if required:
                covered = sum(1 for r in required if r.lower() in output_lower)
                return min(1.0, covered / len(required) + 0.2)
            return 0.8
        
        elif dimension.name == "citation_accuracy":
            # Check for citations if required
            if task.get("requires_citations"):
                has_citations = "[" in output and "]" in output
                return 1.0 if has_citations else 0.4
            return 0.8  # Citations not required
        
        elif dimension.name == "source_quality":
            # Check for authoritative language
            quality_markers = ["according to", "reported by", "data from", "study"]
            quality_count = sum(1 for m in quality_markers if m in output_lower)
            return min(1.0, 0.5 + quality_count * 0.1)
        
        elif dimension.name == "tool_efficiency":
            if tool_calls:
                expected_count = self._estimate_expected_tools(task_type)
                actual_count = len(tool_calls)
                if actual_count <= expected_count:
                    return 1.0
                elif actual_count <= expected_count * 1.5:
                    return 0.7
                else:
                    return 0.4
            return 0.8  # No tool calls needed or recorded
        
        return 0.5  # Default
    
    def _check_factual_accuracy(self, output: str, 
                                 ground_truth: Dict) -> float:
        """Check output against ground truth."""
        if not ground_truth:
            return 0.7
        
        # Simple keyword matching for demonstration
        key_claims = ground_truth.get("key_claims", [])
        output_lower = output.lower()
        
        matched = sum(1 for claim in key_claims if claim.lower() in output_lower)
        
        if matched == len(key_claims):
            return 1.0
        elif matched >= len(key_claims) * 0.7:
            return 0.8
        elif matched >= len(key_claims) * 0.5:
            return 0.6
        else:
            return 0.3
    
    def _estimate_expected_tools(self, task_type: str) -> int:
        """Estimate expected tool count for task type."""
        estimates = {
            "research": 3,
            "create": 2,
            "analyze": 2,
            "general": 1
        }
        return estimates.get(task_type, 1)
    
    def _score_to_level(self, score: float) -> str:
        """Convert numeric score to level name."""
        if score >= 0.9:
            return "excellent"
        elif score >= 0.7:
            return "good"
        elif score >= 0.5:
            return "acceptable"
        elif score >= 0.25:
            return "poor"
        else:
            return "failed"


# Test Set Management

class TestSet:
    """Manage evaluation test sets."""
    
    def __init__(self, name: str):
        self.name = name
        self.tests: List[Dict] = []
        self.tags: Dict[str, List[int]] = {}
    
    def add_test(self, test: Dict):
        """Add test case to test set."""
        self.tests.append(test)
        idx = len(self.tests) - 1
        
        # Index by tags
        for tag in test.get("tags", []):
            if tag not in self.tags:
                self.tags[tag] = []
            self.tags[tag].append(idx)
    
    def filter(self, **criteria) -> List[Dict]:
        """Filter tests by criteria."""
        results = []
        for test in self.tests:
            match = True
            for key, value in criteria.items():
                if test.get(key) != value:
                    match = False
                    break
            if match:
                results.append(test)
        return results
    
    def get_complexity_distribution(self) -> Dict[str, int]:
        """Get distribution of tests by complexity."""
        distribution = {}
        for test in self.tests:
            complexity = test.get("complexity", "medium")
            distribution[complexity] = distribution.get(complexity, 0) + 1
        return distribution
    
    def create_standard_tests(self) -> "TestSet":
        """Create standard test set for context engineering."""
        tests = [
            {
                "name": "simple_lookup",
                "input": "What is the capital of France?",
                "expected": {"type": "fact", "answer": "Paris"},
                "complexity": "simple",
                "tags": ["knowledge", "simple"]
            },
            {
                "name": "context_retrieval",
                "input": "Based on the user preferences, recommend a restaurant",
                "context": {"user_preferences": {"cuisine": "Italian", "price_range": "moderate"}},
                "complexity": "medium",
                "tags": ["retrieval", "reasoning"]
            },
            {
                "name": "multi_step_reasoning",
                "input": "Analyze the sales data and create a summary report",
                "complexity": "complex",
                "tags": ["analysis", "multi-step"]
            }
        ]
        
        for test in tests:
            self.add_test(test)
        
        return self


# Evaluation Runner

class EvaluationRunner:
    """Run evaluations on test sets."""
    
    def __init__(self, evaluator: AgentEvaluator, test_set: TestSet):
        self.evaluator = evaluator
        self.test_set = test_set
        self.results: List[Dict] = []
    
    def run_all(self, verbose: bool = False) -> Dict:
        """Run evaluation on all tests."""
        self.results = []
        
        for i, test in enumerate(self.test_set.tests):
            if verbose:
                print(f"Running test {i+1}/{len(self.test_set.tests)}: {test['name']}")
            
            result = self.run_test(test)
            self.results.append(result)
        
        return self.summarize()
    
    def run_test(self, test: Dict) -> Dict:
        """Run single evaluation test."""
        # In production, run actual agent
        # Here we simulate
        output = f"Simulated output for: {test.get('input', '')}"
        
        evaluation = self.evaluator.evaluate(
            task=test,
            output=output,
            ground_truth=test.get("expected"),
            tool_calls=[]
        )
        
        return {
            "test": test,
            "output": output,
            "evaluation": evaluation,
            "passed": evaluation["passed"]
        }
    
    def summarize(self) -> Dict:
        """Summarize evaluation results."""
        if not self.results:
            return {"error": "No results"}
        
        passed = sum(1 for r in self.results if r["passed"])
        
        # Dimension averages
        dimension_totals = {}
        for dim_name in self.evaluator.rubric.keys():
            dimension_totals[dim_name] = {"total": 0, "count": 0}
        
        for result in self.results:
            for dim_name, score in result["evaluation"]["dimension_scores"].items():
                dimension_totals[dim_name]["total"] += score["score"]
                dimension_totals[dim_name]["count"] += 1
        
        dimension_averages = {}
        for dim_name, data in dimension_totals.items():
            if data["count"] > 0:
                dimension_averages[dim_name] = data["total"] / data["count"]
        
        return {
            "total_tests": len(self.results),
            "passed": passed,
            "failed": len(self.results) - passed,
            "pass_rate": passed / len(self.results) if self.results else 0,
            "dimension_averages": dimension_averages,
            "failures": [
                {"test": r["test"]["name"], "score": r["evaluation"]["overall_score"]}
                for r in self.results
                if not r["passed"]
            ]
        }


# Production Monitoring

class ProductionMonitor:
    """Monitor agent performance in production."""
    
    def __init__(self, sample_rate: float = 0.01):
        self.sample_rate = sample_rate
        self.samples: List[Dict] = []
        self.alert_thresholds = {
            "pass_rate_warning": 0.85,
            "pass_rate_critical": 0.70
        }
    
    def should_sample(self) -> bool:
        """Determine if current interaction should be sampled."""
        import random
        return random.random() < self.sample_rate
    
    def record_sample(self, query: str, output: str, 
                      evaluation: Dict):
        """Record a production sample for evaluation."""
        sample = {
            "query": query[:200],
            "output_preview": output[:200],
            "score": evaluation.get("overall_score", 0),
            "passed": evaluation.get("passed", False),
            "timestamp": time.time()
        }
        self.samples.append(sample)
    
    def get_metrics(self) -> Dict:
        """Calculate current metrics from samples."""
        if not self.samples:
            return {"status": "insufficient_data"}
        
        passed = sum(1 for s in self.samples if s["passed"])
        pass_rate = passed / len(self.samples)
        avg_score = sum(s["score"] for s in self.samples) / len(self.samples)
        
        status = "healthy"
        if pass_rate < self.alert_thresholds["pass_rate_critical"]:
            status = "critical"
        elif pass_rate < self.alert_thresholds["pass_rate_warning"]:
            status = "warning"
        
        return {
            "sample_count": len(self.samples),
            "pass_rate": pass_rate,
            "average_score": avg_score,
            "status": status,
            "alerts": self._generate_alerts(pass_rate, avg_score)
        }
    
    def _generate_alerts(self, pass_rate: float, 
                         avg_score: float) -> List[Dict]:
        """Generate alerts based on metrics."""
        alerts = []
        
        if pass_rate < self.alert_thresholds["pass_rate_critical"]:
            alerts.append({
                "type": "critical",
                "message": f"Pass rate ({pass_rate:.2f}) below critical threshold"
            })
        elif pass_rate < self.alert_thresholds["pass_rate_warning"]:
            alerts.append({
                "type": "warning",
                "message": f"Pass rate ({pass_rate:.2f}) below warning threshold"
            })
        
        if avg_score < 0.6:
            alerts.append({
                "type": "quality",
                "message": f"Average score ({avg_score:.2f}) indicates quality issues"
            })
        
        return alerts
