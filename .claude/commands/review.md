# Code Review

Review the following code or changes: $ARGUMENTS

## Review Checklist

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevented (parameterized queries)
- [ ] workspace_id included in all queries

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching
- [ ] No blocking operations in hot paths

### Code Quality
- [ ] TypeScript strict mode compliant
- [ ] Meaningful variable names
- [ ] Functions under 50 lines
- [ ] Single responsibility principle

### Testing
- [ ] Tests exist for new code
- [ ] Edge cases covered
- [ ] Mocks are appropriate

### Documentation
- [ ] Public functions have JSDoc
- [ ] Complex logic has comments
- [ ] README updated if needed

## Output Format

Provide feedback as:
1. **Critical** — Must fix before merge
2. **Important** — Should fix
3. **Suggestion** — Nice to have
4. **Praise** — What's done well