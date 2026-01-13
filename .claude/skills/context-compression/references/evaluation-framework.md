# Context Compression Evaluation Framework

This document provides the complete evaluation framework for measuring context compression quality, including probe types, scoring rubrics, and LLM judge configuration.

## Probe Types

### Recall Probes

Test factual retention of specific details from conversation history.

**Structure:**
```
Question: [Ask for specific fact from truncated history]
Expected: [Exact detail that should be preserved]
Scoring: Match accuracy of technical details
```

**Examples:**
- "What was the original error message that started this debugging session?"
- "What version of the dependency did we decide to use?"
- "What was the exact command that failed?"

### Artifact Probes

Test file tracking and modification awareness.

**Structure:**
```
Question: [Ask about files created, modified, or examined]
Expected: [Complete list with change descriptions]
Scoring: Completeness of file list and accuracy of change descriptions
```

**Examples:**
- "Which files have we modified? Describe what changed in each."
- "What new files did we create in this session?"
- "Which configuration files did we examine but not change?"

### Continuation Probes

Test ability to continue work without re-fetching context.

**Structure:**
```
Question: [Ask about next steps or current state]
Expected: [Actionable next steps based on session history]
Scoring: Ability to continue without requesting re-read of files
```

**Examples:**
- "What should we do next?"
- "What tests are still failing and why?"
- "What was left incomplete from our last step?"

### Decision Probes

Test retention of reasoning chains and decision rationale.

**Structure:**
```
Question: [Ask about why a decision was made]
Expected: [Reasoning that led to the decision]
Scoring: Preservation of decision context and alternatives considered
```

**Examples:**
- "We discussed options for the Redis issue. What did we decide and why?"
- "Why did we choose connection pooling over per-request connections?"
- "What alternatives did we consider for the authentication fix?"

## Scoring Rubrics

### Accuracy Dimension

| Criterion | Question | Score 0 | Score 3 | Score 5 |
|-----------|----------|---------|---------|---------|
| accuracy_factual | Are facts, file paths, and technical details correct? | Completely incorrect or fabricated | Mostly accurate with minor errors | Perfectly accurate |
| accuracy_technical | Are code references and technical concepts correct? | Major technical errors | Generally correct with minor issues | Technically precise |

### Context Awareness Dimension

| Criterion | Question | Score 0 | Score 3 | Score 5 |
|-----------|----------|---------|---------|---------|
| context_conversation_state | Does the response reflect current conversation state? | No awareness of prior context | General awareness with gaps | Full awareness of conversation history |
| context_artifact_state | Does the response reflect which files/artifacts were accessed? | No awareness of artifacts | Partial artifact awareness | Complete artifact state awareness |

### Artifact Trail Dimension

| Criterion | Question | Score 0 | Score 3 | Score 5 |
|-----------|----------|---------|---------|---------|
| artifact_files_created | Does the agent know which files were created? | No knowledge | Knows most files | Perfect knowledge |
| artifact_files_modified | Does the agent know which files were modified and what changed? | No knowledge | Good knowledge of most modifications | Perfect knowledge of all modifications |
| artifact_key_details | Does the agent remember function names, variable names, error messages? | No recall | Recalls most key details | Perfect recall |

### Completeness Dimension

| Criterion | Question | Score 0 | Score 3 | Score 5 |
|-----------|----------|---------|---------|---------|
| completeness_coverage | Does the response address all parts of the question? | Ignores most parts | Addresses most parts | Addresses all parts thoroughly |
| completeness_depth | Is sufficient detail provided? | Superficial or missing detail | Adequate detail | Comprehensive detail |

### Continuity Dimension

| Criterion | Question | Score 0 | Score 3 | Score 5 |
|-----------|----------|---------|---------|---------|
| continuity_work_state | Can the agent continue without re-fetching previously accessed information? | Cannot continue without re-fetching all context | Can continue with minimal re-fetching | Can continue seamlessly |
| continuity_todo_state | Does the agent maintain awareness of pending tasks? | Lost track of all TODOs | Good awareness with some gaps | Perfect task awareness |
| continuity_reasoning | Does the agent retain rationale behind previous decisions? | No memory of reasoning | Generally remembers reasoning | Excellent retention |

### Instruction Following Dimension

| Criterion | Question | Score 0 | Score 3 | Score 5 |
|-----------|----------|---------|---------|---------|
| instruction_format | Does the response follow the requested format? | Ignores format | Generally follows format | Perfectly follows format |
| instruction_constraints | Does the response respect stated constraints? | Ignores constraints | Mostly respects constraints | Fully respects all constraints |

## LLM Judge Configuration

### System Prompt

```
You are an expert evaluator assessing AI assistant responses in software development conversations.

Your task is to grade responses against specific rubric criteria. For each criterion:
1. Read the criterion question carefully
2. Examine the response for evidence
3. Assign a score from 0-5 based on the scoring guide
4. Provide brief reasoning for your score

Be objective and consistent. Focus on what is present in the response, not what could have been included.
```

### Judge Input Format

```json
{
  "probe_question": "What was the original error message?",
  "model_response": "[Response to evaluate]",
  "compacted_context": "[The compressed context that was provided]",
  "ground_truth": "[Optional: known correct answer]",
  "rubric_criteria": ["accuracy_factual", "accuracy_technical", "context_conversation_state"]
}
```

### Judge Output Format

```json
{
  "criterionResults": [
    {
      "criterionId": "accuracy_factual",
      "score": 5,
      "reasoning": "Response correctly identifies the 401 error, specific endpoint, and root cause."
    }
  ],
  "aggregateScore": 4.8,
  "dimensionScores": {
    "accuracy": 4.9,
    "context_awareness": 4.5,
    "artifact_trail": 3.2,
    "completeness": 5.0,
    "continuity": 4.8,
    "instruction_following": 5.0
  }
}
```

## Benchmark Results Reference

Performance across compression methods (based on 36,000+ messages):

| Method | Overall | Accuracy | Context | Artifact | Complete | Continuity | Instruction |
|--------|---------|----------|---------|----------|----------|------------|-------------|
| Anchored Iterative | 3.70 | 4.04 | 4.01 | 2.45 | 4.44 | 3.80 | 4.99 |
| Regenerative | 3.44 | 3.74 | 3.56 | 2.33 | 4.37 | 3.67 | 4.95 |
| Opaque | 3.35 | 3.43 | 3.64 | 2.19 | 4.37 | 3.77 | 4.92 |

**Key Findings:**

1. **Accuracy gap**: 0.61 points between best and worst methods
2. **Context awareness gap**: 0.45 points, favoring anchored iterative
3. **Artifact trail**: Universally weak (2.19-2.45), needs specialized handling
4. **Completeness and instruction following**: Minimal differentiation

## Statistical Considerations

- Differences of 0.26-0.35 points are consistent across task types and session lengths
- Pattern holds for both short and long sessions
- Pattern holds across debugging, feature implementation, and code review tasks
- Sample size: 36,611 messages across hundreds of compression points

## Implementation Notes

### Probe Generation

Generate probes at each compression point based on truncated history:
1. Extract factual claims for recall probes
2. Extract file operations for artifact probes
3. Extract incomplete tasks for continuation probes
4. Extract decision points for decision probes

### Grading Process

1. Feed probe question + model response + compressed context to judge
2. Evaluate against each criterion in rubric
3. Output structured JSON with scores and reasoning
4. Compute dimension scores as weighted averages
5. Compute overall score as unweighted average of dimensions

### Blinding

The judge should not know which compression method produced the response being evaluated. This prevents bias toward known methods.

