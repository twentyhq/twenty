# Feature: {Feature Name}

> **Module:** {Parent Module}  
> **Version:** 0.1.0  
> **Status:** Draft | In Progress | Complete | Deprecated  
> **Owner:** {Owner}  
> **Priority:** Must Have | Should Have | Nice to Have  
> **Created:** {Date}  
> **Updated:** {Date}

---

## 1. Summary

{One sentence describing what this feature does.}

---

## 2. User Story

```
As a {role}
I want to {action}
So that {benefit}
```

---

## 3. Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | {Given X, When Y, Then Z} | ⬜ |
| 2 | {Given X, When Y, Then Z} | ⬜ |
| 3 | {Given X, When Y, Then Z} | ⬜ |
| 4 | {Given X, When Y, Then Z} | ⬜ |

---

## 4. Context Requirements

> **Mandatory section.** Every feature must declare its context dependencies.

### 4.1 CDS Dimensions

| Dimension | Value | Rationale |
|-----------|-------|-----------|
| **Mode** | {business / private / hobby} | {Why this mode} |
| **Domains** | {domain1, domain2} | {Why these domains} |
| **Depth** | {overview / standard / deep} | {Why this depth level} |

### 4.2 Required Attributes

| Attribute | Minimum Level | Purpose | If Missing |
|-----------|---------------|---------|------------|
| {attribute_code} | {level or boolean} | {Why needed} | {Fallback behavior} |
| {attribute_code} | {level or boolean} | {Why needed} | {Fallback behavior} |

### 4.3 Relevant Attributes (Boost Relevance)

| Attribute | Effect on Feature |
|-----------|-------------------|
| {attribute_code} | {How it improves results} |
| {attribute_code} | {How it improves results} |

### 4.4 Boosters Activated

> Boosters this feature activates (situations where attributes get amplified)

| Attribute | Condition | Multiplier | Rationale |
|-----------|-----------|------------|-----------|
| {attribute_code} | {situation this feature creates} | {×N.N} | {Why boosted} |

### 4.5 Blockers Respected

> Blockers this feature respects (situations where attributes are suppressed)

| Attribute | Blocked When | Behavior |
|-----------|--------------|----------|
| {attribute_code} | {situation} | {What happens instead} |

### 4.6 Context Assembly Flow

```
TRIGGER: {What initiates this feature}
    │
    ├── MODE: {mode}
    ├── DOMAINS: [{domain1}, {domain2}]
    ├── DEPTH: {depth}
    │
    ├── PRE-FILTER
    │   ├── Metadata filters: {workspace_id, entity_type, etc.}
    │   └── Mode filter: {mode}
    │
    ├── VECTOR SEARCH
    │   ├── Collection: {which vector collection}
    │   └── Query: {semantic query description}
    │
    ├── POST-FILTER
    │   ├── Attribute relevance: {which attributes boost/filter results}
    │   └── Blockers applied: {which blockers might suppress results}
    │
    └── OUTPUT: {What context is assembled for LLM/response}
```

---

## 5. Engine Mapping

### 5.1 Engines Involved

| Engine | Role | Tools/Endpoints Used |
|--------|------|----------------------|
| Context | Context assembly and attributes | `context_get_context`, `context_get_attributes` |
| {Engine} | {What it does for this feature} | `{tool_name}` |
| {Engine} | {What it does for this feature} | `{tool_name}` |

### 5.2 Data Flow

```
{Trigger} 
    → Context Engine: assemble context (mode, attributes)
    → {Engine 1}: {action}
    → {Engine 2}: {action}
    → {Output/Result}
```

---

## 6. UI/UX

### 6.1 Entry Point

{Where does the user access this feature?}

### 6.2 User Flow

1. User {action}
2. System {response}
3. User {action}
4. System {response}

### 6.3 Mockups

{Link to mockups or embed images}

---

## 7. Technical Requirements

### 7.1 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| {GET/POST} | `/api/v1/{path}` | {Description} |

### 7.2 MCP Tools

| Tool | Purpose |
|------|---------|
| `context_get_context` | Assemble context for this feature |
| `{domain}_{verb}_{noun}` | {Description} |

### 7.3 Events

**Emits:**

| Event Type | When |
|------------|------|
| `{domain}.{aggregate}.{action}` | {Trigger} |

**Consumes:**

| Event Type | Action |
|------------|--------|
| `{domain}.{aggregate}.{action}` | {What happens} |

---

## 8. Data Requirements

### 8.1 New Entities

| Entity | Schema | Fields |
|--------|--------|--------|
| {Entity} | {schema}.{table} | {Key fields} |

### 8.2 Existing Entities Used

| Entity | How Used |
|--------|----------|
| `context.entity_attributes` | {Read attributes for relevance} |
| {Entity} | {Read/Write, what for} |

### 8.3 Attributes Created/Updated

| Attribute | When | Source Type | Value |
|-----------|------|-------------|-------|
| {attribute_code} | {Trigger} | {quiz/cert/behavior/self} | {How value is determined} |

---

## 9. Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| {option} | {type} | {default} | {Description} |

---

## 10. Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| No matching attributes | {Fallback behavior} |
| Mode mismatch | {How handled} |
| All results blocked | {What user sees} |
| {Edge case} | {How system handles it} |

---

## 11. Error Handling

| Error | Cause | User Message | Recovery |
|-------|-------|--------------|----------|
| Context unavailable | Context Engine down | {Message} | {Recovery steps} |
| {Error} | {Why it happens} | {What user sees} | {How to fix} |

---

## 12. Testing

### 12.1 Context Test Cases

| Test | Setup | Expected |
|------|-------|----------|
| Correct mode applied | Set mode to {mode} | Feature uses {mode} context |
| Attribute boosts work | Entity has {attribute} | Results boosted by ×{N} |
| Blocker suppresses | {blocker condition} active | {attribute} relevance = 0 |
| Missing attribute fallback | Entity lacks {attribute} | {Fallback behavior} |

### 12.2 Unit Tests

| Test | Description |
|------|-------------|
| `test_{name}` | {What it verifies} |

### 12.3 Integration Tests

| Test | Description |
|------|-------------|
| `test_{name}` | {What it verifies} |

### 12.4 Manual Test Cases

| # | Steps | Expected Result |
|---|-------|-----------------|
| 1 | {Steps} | {Result} |

---

## 13. Dependencies

### 13.1 Requires

| Dependency | Type | Why |
|------------|------|-----|
| Context Engine | Engine | Context assembly (required for all features) |
| {Feature/Engine} | {Type} | {Reason} |

### 13.2 Blocks

| Dependent | Why |
|-----------|-----|
| {Feature} | {Reason} |

---

## 14. Rollout

### 14.1 Feature Flag

- Flag: `{flag_name}`
- Default: `false`
- Rollout: {Rollout strategy}

### 14.2 Migration

{Any data migration needed?}

---

## 15. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| {Metric} | {Target} | {How measured} |

---

## 16. Open Questions

| # | Question | Status | Answer |
|---|----------|--------|--------|
| 1 | {Question} | Open | - |

---

## Context Checklist

> Before marking feature complete, verify context implementation:

- [ ] Mode specified and tested
- [ ] Domains identified and accessed correctly
- [ ] Depth level appropriate for feature complexity
- [ ] Required attributes documented with fallbacks
- [ ] Relevant attributes identified for boosting
- [ ] Boosters defined and tested
- [ ] Blockers defined and tested
- [ ] Context assembly flow documented
- [ ] Context-specific test cases passing
- [ ] Edge cases for missing/blocked context handled

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | {Date} | Initial draft |