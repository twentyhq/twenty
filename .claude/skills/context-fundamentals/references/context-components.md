# Context Components: Technical Reference

This document provides detailed technical reference for each context component in agent systems.

## System Prompt Engineering

### Section Structure

Organize system prompts into distinct sections with clear boundaries. A recommended structure:

```
<BACKGROUND_INFORMATION>
Context about the domain, user preferences, or project-specific details
</BACKGROUND_INFORMATION>

<INSTRUCTIONS>
Core behavioral guidelines and task instructions
</INSTRUCTIONS>

<TOOL_GUIDANCE>
When and how to use available tools
</TOOL_GUIDANCE>

<OUTPUT_DESCRIPTION>
Expected output format and quality standards
</OUTPUT_DESCRIPTION>
```

This structure allows agents to locate relevant information quickly and enables selective context loading in advanced implementations.

### Altitude Calibration

The "altitude" of instructions refers to the level of abstraction. Consider these examples:

**Too Low (Brittle):**
```
If the user asks about pricing, check the pricing table in docs/pricing.md.
If the table shows USD, convert to EUR using the exchange rate in
config/exchange_rates.json. If the user is in the EU, add VAT at the
applicable rate from config/vat_rates.json. Format the response with
the currency symbol, two decimal places, and a note about VAT.
```

**Too High (Vague):**
```
Help users with pricing questions. Be helpful and accurate.
```

**Optimal (Heuristic-Driven):**
```
For pricing inquiries:
1. Retrieve current rates from docs/pricing.md
2. Apply user location adjustments (see config/location_defaults.json)
3. Format with appropriate currency and tax considerations

Prefer exact figures over estimates. When rates are unavailable,
say so explicitly rather than projecting.
```

The optimal altitude provides clear steps while allowing flexibility in execution.

## Tool Definition Specification

### Schema Structure

Each tool should define:

```python
{
    "name": "tool_function_name",
    "description": "Clear description of what the tool does and when to use it",
    "parameters": {
        "type": "object",
        "properties": {
            "param_name": {
                "type": "string",
                "description": "What this parameter controls",
                "default": "reasonable_default_value"
            }
        },
        "required": ["param_name"]
    },
    "returns": {
        "type": "object",
        "description": "What the tool returns and its structure"
    }
}
```

### Description Engineering

Tool descriptions should answer: what the tool does, when to use it, and what it produces. Include usage context, examples, and edge cases.

**Weak Description:**
```
Search the database for customer information.
```

**Strong Description:**
```
Retrieve customer information by ID or email.

Use when:
- User asks about a specific customer's details, history, or status
- User provides a customer identifier and needs related information

Returns customer object with:
- Basic info (name, email, account status)
- Order history summary
- Support ticket count

Returns null if customer not found. Returns error if database unreachable.
```

## Retrieved Document Management

### Identifier Design

Design identifiers that convey meaning and enable efficient retrieval:

**Poor identifiers:**
- `data/file1.json`
- `ref/ref.md`
- `2024/q3/report`

**Strong identifiers:**
- `customer_pricing_rates.json`
- `engineering_onboarding_checklist.md`
- `2024_q3_revenue_report.pdf`

Strong identifiers allow agents to locate relevant files even without search tools.

### Document Chunking Strategy

For large documents, chunk strategically to preserve semantic coherence:

```python
# Pseudocode for semantic chunking
def chunk_document(content):
    """Split document at natural semantic boundaries."""
    boundaries = find_section_headers(content)
    boundaries += find_paragraph_breaks(content)
    boundaries += find_logical_breaks(content)
    
    chunks = []
    for i in range(len(boundaries) - 1):
        chunk = content[boundaries[i]:boundaries[i+1]]
        if len(chunk) > MIN_CHUNK_SIZE and len(chunk) < MAX_CHUNK_SIZE:
            chunks.append(chunk)
    
    return chunks
```

Avoid arbitrary character limits that split mid-sentence or mid-concept.

## Message History Management

### Turn Representation

Structure message history to preserve key information:

```python
{
    "role": "user" | "assistant" | "tool",
    "content": "message text",
    "reasoning": "optional chain-of-thought",
    "tool_calls": [list if role="assistant"],
    "tool_output": "output if role="tool"",
    "summary": "compact summary if conversation is long"
}
```

### Summary Injection Pattern

For long conversations, inject summaries at intervals:

```python
def inject_summaries(messages, summary_interval=20):
    """Inject summaries at regular intervals to preserve context."""
    summarized = []
    for i, msg in enumerate(messages):
        summarized.append(msg)
        if i > 0 and i % summary_interval == 0:
            summary = generate_summary(summarized[-summary_interval:])
            summarized.append({
                "role": "system",
                "content": f"Conversation summary: {summary}",
                "is_summary": True
            })
    return summarized
```

## Tool Output Optimization

### Response Formats

Provide response format options to control token usage:

```python
def get_customer_response_format():
    return {
        "format": "concise | detailed",
        "fields": ["id", "name", "email", "status", "history_summary"]
    }
```

The concise format returns essential fields only; detailed returns complete objects.

### Observation Masking

For verbose tool outputs, consider masking patterns:

```python
def mask_observation(output, max_length=500):
    """Replace long observations with compact references."""
    if len(output) <= max_length:
        return output
    
    reference_id = store_observation(output)
    return f"[Previous observation elided. Full content stored at reference {reference_id}]"
```

This preserves information access while reducing token usage.

## Context Budget Estimation

### Token Counting Approximation

For planning purposes, estimate tokens at approximately 4 characters per token for English text:

```
1000 words ≈ 7500 characters ≈ 1800-2000 tokens
```

This is a rough approximation; actual tokenization varies by model and content type.

### Context Budget Allocation

Allocate context budget across components:

| Component | Typical Range | Notes |
|-----------|---------------|-------|
| System prompt | 500-2000 tokens | Stable across session |
| Tool definitions | 100-500 per tool | Grows with tool count |
| Retrieved documents | Variable | Often largest consumer |
| Message history | Variable | Grows with conversation |
| Tool outputs | Variable | Can dominate context |

Monitor actual usage during development to establish baseline allocations.

## Progressive Disclosure Implementation

### Skill Activation Pattern

```python
def activate_skill_context(skill_name, task_description):
    """Load skill context when task matches skill description."""
    skill_metadata = load_all_skill_metadata()
    
    relevant_skills = []
    for skill in skill_metadata:
        if skill_matches_task(skill, task_description):
            relevant_skills.append(skill)
    
    # Load full content only for most relevant skills
    for skill in relevant_skills[:MAX_CONCURRENT_SKILLS]:
        skill_context = load_skill_content(skill)
        inject_into_context(skill_context)
```

### Reference Loading Pattern

```python
def get_reference(file_reference):
    """Load reference file only when explicitly needed."""
    if not file_reference.is_loaded:
        file_reference.content = read_file(file_reference.path)
        file_reference.is_loaded = True
    return file_reference.content
```

This pattern ensures files are loaded once and cached for the session.

