---
paths:
  - docs/**/*.md
  - "**/README.md"
---

# Documentation Rules

## Structure

- Use clear hierarchical headings (##, ###)
- Include version and last updated date for specs
- Keep documents focused — one topic per file

## Version Header (for specs)

```markdown
> **Version:** X.Y.Z
> **Last Updated:** YYYY-MM-DD
> **Status:** Draft | Review | Approved
```

## Content Guidelines

- Lead with purpose/summary
- Use tables for structured data
- Include code examples where helpful
- Use Mermaid or ASCII for diagrams

## API Documentation

When documenting MCP tools:
```markdown
### tool_name

**Purpose:** What it does

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|

**Returns:** Description of response

**Example:**
```json
{ "workspace_id": "..." }
```
```

## Cross-References

- Use `@path/to/file` for imports
- Link to related docs explicitly
- Keep the reference chain navigable