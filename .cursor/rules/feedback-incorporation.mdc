---
description: Guidelines for incorporating user feedback and improving cursor rules
globs: []
alwaysApply: true
---
# Feedback Incorporation Guidelines

## Post-Interaction Reflection

After each coding session or significant interaction, the AI should:

### 1. Reflect on User Feedback
- **Identify patterns** in user corrections or suggestions
- **Note recurring issues** that could be prevented with better rules
- **Recognize gaps** in current cursor rules or guidelines

### 2. Suggest Rule Improvements
When user provides feedback that reveals a pattern or preference:

```typescript
// Example feedback patterns to watch for:
// - "We don't use useEffect, handle state changes in event callbacks"
// - "We don't use JSDoc blocks, prefer // comments"
// - "Always use named exports, never default exports"
// - "We prefer functional components over class components"
// - "Use event handlers over useEffect for state updates"
```

### 3. Proactive Rule Suggestions
At the end of interactions, suggest:

```markdown
## 💡 Suggested Cursor Rule Updates

Based on your feedback today, I recommend adding/updating these rules:

**Code Style Rule Update:**
- Add preference for // comments over JSDoc blocks
- Enforce named exports only (no default exports)

**React Guidelines Update:**
- Document preference for event handlers over useEffect
- Add functional components only rule

Would you like me to help incorporate these into your cursor rules?
```

## Implementation Process

### When to Suggest Updates
- User corrects the same type of mistake multiple times
- User explains a codebase-specific preference
- User points out missing functionality or incomplete implementations
- User provides context about existing patterns not captured in rules

### How to Present Suggestions
1. **Summarize the pattern** observed from feedback
2. **Propose specific rule language** that would prevent the issue
3. **Explain the benefit** of codifying this knowledge
4. **Ask for confirmation** before implementing

### Rule Categories to Consider
- **Code Style**: Formatting, naming, comment styles, export patterns
- **React Patterns**: Hook usage, component structure, state management
- **Architecture**: File organization, import patterns, component composition
- **Testing**: Test structure, naming, coverage expectations
- **Performance**: Optimization patterns, anti-patterns to avoid

## Example Feedback Integration

```markdown
## Today's Learning: React State Management Patterns

**User Feedback Received:**
- "We don't use useEffect, handle state changes in event callbacks"
- "We don't use JSDoc blocks, prefer // comments"
- "Always use named exports, never default exports"

**Proposed Rule Additions:**
```typescript
// ✅ React State Updates - Use event handlers, not useEffect
const handleButtonClick = () => {
  setData(newData); // Direct state update in event handler
};

// ❌ Avoid useEffect for state updates
// useEffect(() => { setData(newData); }, [trigger]);

// ✅ Named exports only
export const UserComponent = () => {};
export const useUserData = () => {};
```

**Benefits:**
- Prevents useEffect overuse and related bugs
- Ensures consistent export patterns across codebase
- Documents preferred React patterns for the team
```

This approach helps the AI learn from each interaction and continuously improve the development experience.