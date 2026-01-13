# Module: {Module Name}

> **Version:** 0.1.0  
> **Status:** Draft | Active | Deprecated  
> **Owner:** {Owner}  
> **Created:** {Date}  
> **Updated:** {Date}

---

## 1. Overview

### 1.1 Purpose

{One paragraph describing what this module does and the problem it solves.}

### 1.2 Value Proposition

{Why would a customer want this? What pain does it address?}

### 1.3 Target Users

| User | How They Use This Module |
|------|--------------------------|
| {Role} | {Description} |
| {Role} | {Description} |

---

## 2. Module Definition

### 2.1 Scope

**This module IS:**
- {What it does}
- {What it includes}

**This module is NOT:**
- {What it doesn't do}
- {What belongs elsewhere}

### 2.2 Engines Used

| Engine | How Used |
|--------|----------|
| Context | {Required: What context this module needs} |
| {Engine} | {What this module needs from the engine} |
| {Engine} | {What this module needs from the engine} |

### 2.3 Extensions Supported

| Extension | Customizations |
|-----------|----------------|
| Restaurant | {Industry-specific behavior} |
| Retail | {Industry-specific behavior} |
| Healthcare | {Industry-specific behavior} |

---

## 3. Context Requirements

> **Mandatory section.** Every module must declare its context dependencies.

### 3.1 Mode

| Mode | When Active | Description |
|------|-------------|-------------|
| business | {When/if this module operates in business mode} | {What changes in business mode} |
| private | {When/if this module operates in private mode} | {What changes in private mode} |
| hobby | {When/if this module operates in hobby mode} | {What changes in hobby mode} |

**Primary Mode:** {Which mode is the default/main mode for this module}

### 3.2 Domains Touched

| Domain | Access | Purpose |
|--------|--------|---------|
| {domain} | Read | {Why this module reads from it} |
| {domain} | Write | {Why this module writes to it} |
| {domain} | Read/Write | {Why this module needs both} |

### 3.3 Attributes Required

| Attribute | Required Level | Purpose | Fallback |
|-----------|----------------|---------|----------|
| {attribute_code} | {level or boolean} | {Why needed} | {What happens if missing} |
| {attribute_code} | {level or boolean} | {Why needed} | {What happens if missing} |

### 3.4 Attributes Produced

| Attribute | When Created | Source Type | Description |
|-----------|--------------|-------------|-------------|
| {attribute_code} | {Trigger event} | {quiz/cert/behavior/self} | {What this attribute represents} |

### 3.5 Boosters & Blockers

**Default Boosters (module-level):**

| Attribute | Condition | Multiplier | Rationale |
|-----------|-----------|------------|-----------|
| {attribute_code} | {situation} | {×N.N} | {Why this boost} |

**Default Blockers (module-level):**

| Attribute | Condition | Rationale |
|-----------|-----------|-----------|
| {attribute_code} | {situation} | {Why blocked} |

### 3.6 Depth Requirements

| Feature/Operation | Default Depth | Deep When |
|-------------------|---------------|-----------|
| {feature} | overview | {Never needs more} |
| {feature} | standard | {Condition requiring deep} |
| {feature} | deep | {Always needs full context} |

---

## 4. Features

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| {Feature name} | Must Have | 📋 Planned | {Brief description} |
| {Feature name} | Should Have | 📋 Planned | {Brief description} |
| {Feature name} | Nice to Have | 📋 Planned | {Brief description} |

See `features/` folder for detailed feature specifications.

---

## 5. User Stories

### 5.1 Primary Stories

```
As a {role}
I want to {action}
So that {benefit}
```

```
As a {role}
I want to {action}
So that {benefit}
```

### 5.2 Secondary Stories

```
As a {role}
I want to {action}
So that {benefit}
```

---

## 6. Activation & Configuration

### 6.1 How to Activate

{How does a workspace enable this module?}

- Feature flag: `module_{module_name}`
- Configuration: `sys.config` key `module.{module_name}.settings`

### 6.2 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| {option} | boolean | true | {Description} |
| {option} | string | "{value}" | {Description} |

### 6.3 Prerequisites

| Requirement | Why |
|-------------|-----|
| Context Engine deployed | Required for all modules |
| {Requirement} | {Reason} |

---

## 7. Data & Events

### 7.1 Data Created

| Entity | Schema | Description |
|--------|--------|-------------|
| {Entity} | {schema}.{table} | {What it stores} |

### 7.2 Events Emitted

| Event Type | When | Payload |
|------------|------|---------|
| `{module}.{aggregate}.{action}` | {Trigger} | {Payload summary} |

### 7.3 Events Consumed

| Event Type | From | Action |
|------------|------|--------|
| `{domain}.{aggregate}.{action}` | {Engine} | {What happens} |
| `context.mode.changed` | Context | {How module reacts to mode change} |

---

## 8. Integration Points

### 8.1 Context Engine Integration

| Integration | Purpose |
|-------------|---------|
| `context_get_context` | {How used} |
| `context_get_attributes` | {How used} |
| `context_set_attribute` | {How used} |

### 8.2 Channels Used

| Channel | Purpose |
|---------|---------|
| Voice | {How voice is used} |
| SMS | {How SMS is used} |
| Email | {How email is used} |

### 8.3 External Systems

| System | Integration |
|--------|-------------|
| {System} | {How it connects} |

---

## 9. Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| {Metric} | {Target} | {Measurement method} |
| {Metric} | {Target} | {Measurement method} |

---

## 10. File Structure

```
modules/{module-name}/
├── README.md                  ← This file
├── features/
│   ├── {feature-1}.md         ← Feature spec
│   └── {feature-2}.md
└── assets/
    └── {diagrams, mockups}
```

---

## 11. Dependencies

### 11.1 Requires

| Dependency | Type | Why |
|------------|------|-----|
| Context Engine | Engine | Context assembly and attributes (required for all) |
| {Engine/Module} | Engine | {Reason} |
| {Engine/Module} | Module | {Reason} |

### 11.2 Required By

| Dependent | Why |
|-----------|-----|
| {Module} | {Reason} |

---

## 12. Roadmap

| Phase | Features | Target |
|-------|----------|--------|
| MVP | {Feature list} | {Date} |
| V1.0 | {Feature list} | {Date} |
| Future | {Feature list} | TBD |

---

## Context Checklist

> Before marking module complete, verify context requirements:

- [ ] Primary mode identified
- [ ] All domains listed with access type
- [ ] Required attributes documented with fallbacks
- [ ] Produced attributes documented with triggers
- [ ] Boosters defined (or explicitly "none")
- [ ] Blockers defined (or explicitly "none")
- [ ] Depth requirements per feature documented
- [ ] Context Engine integration points specified
- [ ] Mode change event handling defined

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | {Date} | Initial draft |