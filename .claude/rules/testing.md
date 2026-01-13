---
paths:
  - "**/*.test.ts"
  - "**/__tests__/**"
---

# Testing Rules

## Test File Location

- Place tests alongside source: `foo.ts` → `foo.test.ts`
- Or in `__tests__/` directory

## Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('methodName', () => {
    it('should do X when Y', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw error when Z', () => {
      expect(() => fn()).toThrow();
    });
  });
});
```

## Mocking

- Mock external services (Supabase, Redis)
- Never make real network calls in tests
- Use dependency injection for mockability

## Coverage

- Aim for 80%+ on new code
- Test edge cases explicitly
- Test error paths, not just happy path

## Running Tests

```bash
bun run test              # All tests
bun run test foo.test.ts  # Single file
bun run test --watch      # Watch mode
```