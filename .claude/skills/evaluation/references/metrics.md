# Evaluation Reference: Metrics and Implementation

This document provides implementation details for evaluation metrics and evaluation systems.

## Core Metric Definitions

### Factual Accuracy

Factual accuracy measures whether claims in agent output match ground truth.

```
Excellent (1.0): All claims verified against ground truth, no errors
Good (0.8): Minor errors that do not affect main conclusions
Acceptable (0.6): Major claims correct, minor inaccuracies present
Poor (0.3): Significant factual errors in key claims
Failed (0.0): Fundamental factual errors that invalidate output
```

Calculation approach:
- Extract claims from output
- Verify each claim against ground truth
- Weight claims by importance (major claims more weight)
- Calculate weighted average of claim accuracy

### Completeness

Completeness measures whether output covers all requested aspects.

```
Excellent (1.0): All requested aspects thoroughly covered
Good (0.8): Most aspects covered with minor gaps
Acceptable (0.6): Key aspects covered, some gaps
Poor (0.3): Major aspects missing from output
Failed (0.0): Fundamental aspects not addressed
```

### Citation Accuracy

Citation accuracy measures whether cited sources match claimed sources.

```
Excellent (1.0): All citations accurate and complete
Good (0.8): Minor citation formatting issues
Acceptable (0.6): Major citations accurate
Poor (0.3): Significant citation problems
Failed (0.0): Citations missing or completely incorrect
```

### Source Quality

Source quality measures whether appropriate primary sources were used.

```
Excellent (1.0): Primary authoritative sources
Good (0.8): Mostly primary sources with some secondary
Acceptable (0.6): Mix of primary and secondary sources
Poor (0.3): Mostly secondary or unreliable sources
Failed (0.0): No credible sources cited
```

### Tool Efficiency

Tool efficiency measures whether the agent used appropriate tools a reasonable number of times.

```
Excellent (1.0): Optimal tool selection and call count
Good (0.8): Good tool selection with minor inefficiencies
Acceptable (0.6): Appropriate tools with some redundancy
Poor (0.3): Wrong tools or excessive call counts
Failed (0.0): Severe tool misuse or extremely excessive calls
```

## Rubric Implementation

```python
EVALUATION_DIMENSIONS = {
    "factual_accuracy": {
        "weight": 0.30,
        "description": "Claims match ground truth",
        "levels": {
            "excellent": 1.0,
            "good": 0.8,
            "acceptable": 0.6,
            "poor": 0.3,
            "failed": 0.0
        }
    },
    "completeness": {
        "weight": 0.25,
        "description": "All requested aspects covered",
        "levels": {
            "excellent": 1.0,
            "good": 0.8,
            "acceptable": 0.6,
            "poor": 0.3,
            "failed": 0.0
        }
    },
    "citation_accuracy": {
        "weight": 0.15,
        "description": "Citations match sources",
        "levels": {
            "excellent": 1.0,
            "good": 0.8,
            "acceptable": 0.6,
            "poor": 0.3,
            "failed": 0.0
        }
    },
    "source_quality": {
        "weight": 0.10,
        "description": "Appropriate primary sources used",
        "levels": {
            "excellent": 1.0,
            "good": 0.8,
            "acceptable": 0.6,
            "poor": 0.3,
            "failed": 0.0
        }
    },
    "tool_efficiency": {
        "weight": 0.20,
        "description": "Right tools used reasonably",
        "levels": {
            "excellent": 1.0,
            "good": 0.8,
            "acceptable": 0.6,
            "poor": 0.3,
            "failed": 0.0
        }
    }
}

def calculate_overall_score(dimension_scores, rubric):
    """Calculate weighted overall score from dimension scores."""
    total_weight = 0
    weighted_sum = 0
    
    for dimension, score in dimension_scores.items():
        if dimension in rubric:
            weight = rubric[dimension]["weight"]
            weighted_sum += score * weight
            total_weight += weight
    
    return weighted_sum / total_weight if total_weight > 0 else 0
```

## Test Set Management

```python
class TestSet:
    def __init__(self, name):
        self.name = name
        self.tests = []
        self.tags = {}
    
    def add_test(self, test_case):
        """Add test case to test set."""
        self.tests.append(test_case)
        
        # Index by tags
        for tag in test_case.get("tags", []):
            if tag not in self.tags:
                self.tags[tag] = []
            self.tags[tag].append(len(self.tests) - 1)
    
    def filter(self, **criteria):
        """Filter tests by criteria."""
        filtered = []
        for test in self.tests:
            match = True
            for key, value in criteria.items():
                if test.get(key) != value:
                    match = False
                    break
            if match:
                filtered.append(test)
        return filtered
    
    def get_complexity_distribution(self):
        """Get distribution of tests by complexity."""
        distribution = {}
        for test in self.tests:
            complexity = test.get("complexity", "medium")
            distribution[complexity] = distribution.get(complexity, 0) + 1
        return distribution
```

## Evaluation Runner

```python
class EvaluationRunner:
    def __init__(self, test_set, rubric, agent):
        self.test_set = test_set
        self.rubric = rubric
        self.agent = agent
        self.results = []
    
    def run_all(self, verbose=False):
        """Run evaluation on all tests."""
        self.results = []
        
        for i, test in enumerate(self.test_set.tests):
            if verbose:
                print(f"Running test {i+1}/{len(self.test_set.tests)}")
            
            result = self.run_test(test)
            self.results.append(result)
        
        return self.summarize()
    
    def run_test(self, test):
        """Run single evaluation test."""
        # Get agent output
        output = self.agent.run(test["input"])
        
        # Evaluate
        evaluation = self.evaluate_output(output, test)
        
        return {
            "test": test,
            "output": output,
            "evaluation": evaluation
        }
    
    def evaluate_output(self, output, test):
        """Evaluate agent output against test."""
        ground_truth = test.get("expected", {})
        
        dimension_scores = {}
        for dimension, config in self.rubric.items():
            score = self.evaluate_dimension(
                output, ground_truth, dimension, config
            )
            dimension_scores[dimension] = score
        
        overall = calculate_overall_score(dimension_scores, self.rubric)
        
        return {
            "overall_score": overall,
            "dimension_scores": dimension_scores,
            "passed": overall >= 0.7
        }
    
    def summarize(self):
        """Summarize evaluation results."""
        if not self.results:
            return {"error": "No results"}
        
        passed = sum(1 for r in self.results if r["evaluation"]["passed"])
        
        dimension_totals = {}
        for dimension in self.rubric.keys():
            dimension_totals[dimension] = {
                "total": 0,
                "count": 0
            }
        
        for result in self.results:
            for dimension, score in result["evaluation"]["dimension_scores"].items():
                if dimension in dimension_totals:
                    dimension_totals[dimension]["total"] += score
                    dimension_totals[dimension]["count"] += 1
        
        dimension_averages = {}
        for dimension, data in dimension_totals.items():
            if data["count"] > 0:
                dimension_averages[dimension] = data["total"] / data["count"]
        
        return {
            "total_tests": len(self.results),
            "passed": passed,
            "failed": len(self.results) - passed,
            "pass_rate": passed / len(self.results) if self.results else 0,
            "dimension_averages": dimension_averages,
            "failures": [
                r for r in self.results 
                if not r["evaluation"]["passed"]
            ]
        }
```

## Production Monitoring

```python
class ProductionMonitor:
    def __init__(self, sample_rate=0.01):
        self.sample_rate = sample_rate
        self.samples = []
        self.alert_thresholds = {
            "pass_rate_warning": 0.85,
            "pass_rate_critical": 0.70
        }
    
    def sample_and_evaluate(self, query, output):
        """Sample production interaction for evaluation."""
        if random.random() > self.sample_rate:
            return None
        
        evaluation = evaluate_output(output, {}, EVALUATION_RUBRIC)
        
        sample = {
            "query": query[:200],
            "output_preview": output[:200],
            "score": evaluation["overall_score"],
            "passed": evaluation["passed"],
            "timestamp": current_timestamp()
        }
        
        self.samples.append(sample)
        return sample
    
    def get_metrics(self):
        """Calculate current metrics from samples."""
        if not self.samples:
            return {"status": "insufficient_data"}
        
        passed = sum(1 for s in self.samples if s["passed"])
        pass_rate = passed / len(self.samples)
        
        avg_score = sum(s["score"] for s in self.samples) / len(self.samples)
        
        return {
            "sample_count": len(self.samples),
            "pass_rate": pass_rate,
            "average_score": avg_score,
            "status": self._get_status(pass_rate)
        }
    
    def _get_status(self, pass_rate):
        """Get status based on pass rate."""
        if pass_rate < self.alert_thresholds["pass_rate_critical"]:
            return "critical"
        elif pass_rate < self.alert_thresholds["pass_rate_warning"]:
            return "warning"
        else:
            return "healthy"
```

