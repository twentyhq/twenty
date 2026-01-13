# Implement with Tests

Implement the following using test-driven development: $ARGUMENTS

## TDD Workflow

1. **Write tests first**
   - Create test file if it doesn't exist
   - Write tests for expected behavior
   - Include edge cases
   - Run tests — they should FAIL

2. **Implement code**
   - Write minimal code to pass tests
   - Do NOT modify tests to make them pass
   - Run tests after each change

3. **Refactor**
   - Clean up code while keeping tests green
   - Extract common patterns
   - Improve naming

4. **Verify**
   - Run full test suite
   - Run typecheck
   - Run linter

## Rules

- Tests go in `__tests__/` or alongside source as `*.test.ts`
- Use Bun test runner: `bun run test`
- Mock external dependencies (Supabase, Redis)
- Every function needs at least one test
- Aim for 80%+ coverage on new code