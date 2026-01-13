# Templates Guide

How to use the provided templates effectively.

## Available Templates

| Template | Location | Use When |
|----------|----------|----------|
| Plan | `.claude/templates/plan.md` | Starting complex task |
| Decision Record | `.claude/templates/decision-record.md` | Making significant technical choice |
| Feature Spec | `.claude/templates/feature-spec.md` | Designing new feature |

## Using Templates

### Method 1: Ask Claude

```
Create a plan for implementing user authentication using the plan template.
```

Claude will read `@.claude/templates/plan.md` and create a filled-in version.

### Method 2: Copy and Fill

```bash
cp .claude/templates/plan.md Plan.md
# Edit Plan.md
```

### Method 3: Reference in Prompts

```
I need to make a decision about database choice.
Use @.claude/templates/decision-record.md format.
```

## Template Conventions

### Placeholders

Templates use `{placeholder}` syntax:
- `{Task Title}` → Replace with actual title
- `{YYYY-MM-DD}` → Replace with date
- `{description}` → Replace with content

### Status Values

Common status progressions:
- Plan: `Planning → In Progress → Blocked → Complete`
- Decision: `Proposed → Accepted → Deprecated`
- Feature: `Draft → Review → Approved → Implemented`

### Checkboxes

Use markdown checkboxes for trackable items:
```markdown
- [ ] Not done
- [x] Done
```

## Creating New Templates

If you need a new template type:

1. Create in `.claude/templates/`
2. Include clear placeholder markers
3. Add usage instructions at bottom
4. Reference from CLAUDE.md

## Template Locations

```
.claude/
├── templates/
│   ├── plan.md              # Task tracking
│   ├── decision-record.md   # ADRs
│   ├── feature-spec.md      # Feature design
│   └── {your-template}.md   # Custom
```

## Output Locations

Where to save filled templates:

| Template | Output Location |
|----------|-----------------|
| Plan | `./Plan.md` (working dir) |
| Decision | `docs/decisions/NNN-title.md` |
| Feature | `docs/features/` or `docs/` |

## Best Practices

1. **Don't modify templates directly** — Copy first
2. **Keep templates generic** — Project-specific goes in copies
3. **Version control filled templates** — They're documentation
4. **Update as work progresses** — Living documents