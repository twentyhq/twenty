# Tool Design Best Practices

This document provides additional best practices and guidelines for designing tools for agent systems.

## Tool Philosophy

Tools are the primary interface between agents and the world. Unlike traditional APIs designed for developers who understand underlying systems, tools must be designed for language models that infer intent from descriptions and generate calls from natural language requests. This fundamental difference requires rethinking how we design and document tool interfaces.

The goal is to create tools that agents can discover, understand, and use correctly without extensive trial and error. Every ambiguity in tool definitions becomes a potential failure mode. Every unclear parameter name forces the agent to guess. Every missing example leaves the agent without guidance for edge cases.

## Description Engineering Principles

### Principle 1: Answer the Fundamental Questions

Every tool description should clearly answer four questions. What does the tool do? State exactly what the tool accomplishes in specific terms, avoiding vague language like "helps with" or "can be used for." When should it be used? Provide specific triggers and contexts, including both direct triggers and indirect signals that indicate the tool's applicability. What inputs does it accept? Document parameters with types, constraints, and defaults, explaining what each parameter controls. What does it return? Describe output format and structure, including examples of successful responses and error conditions.

### Principle 2: Use Consistent Structure

Maintain consistent structure across all tool descriptions in your codebase. When agents encounter a new tool, they should be able to predict where to find specific information based on patterns learned from other tools. This reduces cognitive overhead and prevents errors caused by inconsistent formatting.

A recommended structure includes a brief description in the first sentence, a detailed explanation with usage context, a parameters section with clear type information, a returns section describing output structure, and an errors section listing possible failure modes with recovery guidance.

### Principle 3: Include Concrete Examples

Examples bridge the gap between abstract description and actual usage. Include examples of typical calls showing common parameter combinations, examples of edge cases and how to handle them, and examples of error responses and appropriate recovery actions.

Good examples are specific rather than generic. Instead of "Use an ID like '123'", use "Use format: 'CUST-######' (e.g., 'CUST-000001')". Instead of "Provide a date", use "Format: 'YYYY-MM-DD' (e.g., '2024-01-15')".

## Naming Conventions

### Parameter Naming

Parameter names should be self-documenting. Use names that clearly indicate purpose without requiring additional explanation. Prefer full words over abbreviations except for widely understood acronyms like "id" or "url". Use consistent naming across tools for similar concepts.

Good parameter names include customer_id, search_query, output_format, max_results, and include_details. Poor parameter names include x, val, param1, and info.

### Enumeration Values

When parameters accept enumerated values, use consistent naming across all tools. For boolean-style options, use prefix patterns like "include_" for affirmative options (include_history, include_metadata) and "exclude_" for negative options (exclude_archived, exclude_inactive). For categorical values, use consistent terminology like "format": "concise" | "detailed" rather than mixing "format": "short" | "long" in some tools and "format": "brief" | "complete" in others.

## Error Message Design

### The Dual Audience

Error messages serve two audiences with different needs. Developers debugging issues need detailed technical information including stack traces and internal state. Agents recovering from failures need actionable guidance that tells them what went wrong and how to correct it.

Design error messages with agent recovery as the primary consideration. Include what specifically went wrong in clear language. Provide resolution guidance describing what the agent should do next. Include corrected format for input errors. Add examples of valid input.

### Error Message Structure

```json
{
    "error": {
        "code": "INVALID_CUSTOMER_ID",
        "category": "validation",
        "message": "Customer ID 'CUST-123' does not match required format",
        "expected_format": {
            "description": "Customer ID must be 9 characters",
            "pattern": "CUST-######",
            "example": "CUST-000001"
        },
        "resolution": "Provide a customer ID matching pattern CUST-######",
        "retryable": true
    }
}
```

### Common Error Patterns

Validation errors should specify what was received, what format was expected, and how to correct it. Rate limit errors should specify wait time and retry guidance. Not found errors should suggest alternative approaches or verification steps. System errors should indicate whether retry is appropriate and suggest alternatives.

## Response Format Optimization

### The Token-Accuracy Trade-off

Verbose responses provide comprehensive information but consume significant context tokens. Concise responses minimize token usage but may lack necessary detail. The optimal approach provides format options that allow agents to request appropriate verbosity for their needs.

### Format Options Pattern

```python
def get_customer_response(format: str = "concise"):
    """
    Retrieve customer information.
    
    Args:
        format: Response format - 'concise' for key fields only,
                'detailed' for complete customer record
    """
    if format == "concise":
        return {
            "id": customer.id,
            "name": customer.name,
            "status": customer.status
        }
    else:  # detailed
        return {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "address": customer.address,
            "status": customer.status,
            "created_at": customer.created_at,
            "history": customer.history,
            "preferences": customer.preferences
        }
```

### When to Use Each Format

Use concise format for quick verification or simple lookups, when only confirmation is needed, and in subsequent tool calls after initial retrieval. Use detailed format when making decisions based on customer data, when output becomes input for other processing, and when complete context is necessary for correctness.

## Tool Collection Design

### Managing Tool Proliferation

As agent systems grow, tool collections tend to proliferate. More tools can enable more capabilities but create selection challenges. Research shows that tool description overlap causes model confusion. The key insight is that if a human engineer cannot definitively say which tool should be used in a given situation, an agent cannot be expected to do better.

### Consolidation Guidelines

Consolidate tools that represent sequential steps in a single workflow into a single tool that handles the entire workflow. For example, instead of list_users, list_events, and create_event, implement schedule_event that finds availability and schedules in one call.

Keep separate tools that have fundamentally different behaviors even if they share some functionality. Tools used in different contexts should maintain separation to prevent confusion.

Maintain clear boundaries between tools even when they operate in similar domains. Overlapping functionality should be minimized through careful design.

### Tool Selection Guidance

When designing tool collections, consider what information an agent needs to make correct selections. If multiple tools could apply to a situation, clarify the distinction in descriptions. Use namespacing to create logical groupings that help agents navigate the tool space.

## Testing Tool Design

### Evaluation Criteria

Evaluate tool designs against clarity, completeness, recoverability, efficiency, and consistency criteria. Clarity measures whether agents can determine when to use the tool. Completeness measures whether descriptions include all necessary information. Recoverability measures whether agents can recover from errors. Efficiency measures whether tools support appropriate response formats. Consistency measures whether tools follow naming and schema conventions.

### Agent Testing Pattern

Test tools by presenting representative agent requests and evaluating the resulting tool calls:

1. Prepare test cases with diverse agent requests
2. Have an agent formulate tool calls for each request
3. Evaluate call correctness against expected patterns
4. Identify common failure modes
5. Refine tool definitions based on findings

## Anti-Patterns to Avoid

### Vague Descriptions

Bad: "Search the database for customer information." This leaves too many questions unanswered. What database? What information is available? What format should queries take?

Good: "Retrieve customer information by ID or email. Use when user asks about specific customer details, history, or status. Returns customer object with id, name, email, account_status, and optional order history."

### Cryptic Parameter Names

Bad: Parameters named x, val, or param1 force agents to guess meaning.

Good: Parameters named customer_id, max_results, or include_history are self-documenting.

### Missing Error Handling

Bad: Tools that fail with generic errors or no error handling.

Good: Tools that provide specific error types, messages, and resolution guidance.

### Inconsistent Naming

Bad: Using id in some tools, identifier in others, customer_id in some and user_id in others for similar concepts.

Good: Maintaining consistent naming patterns across all tools for similar concepts.

## Checklist for Tool Design

Before deploying a new tool, verify that the description clearly states what the tool does and when to use it. Verify that all parameters have descriptive names and clear type information. Verify that return values are documented with structure and examples. Verify that error cases are covered with actionable messages. Verify that the tool follows naming conventions used elsewhere. Verify that examples demonstrate common usage patterns. Verify that format options are available if response size varies significantly.

