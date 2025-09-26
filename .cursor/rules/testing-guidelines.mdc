---
description: Testing guidelines for Twenty CRM
alwaysApply: false
---
# Testing Guidelines

## Test Structure (AAA Pattern)
```typescript
describe('UserService', () => {
  describe('when getting user by ID', () => {
    it('should return user data for valid ID', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: '123', name: 'John' };
      mockUserRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
    });
  });
});
```

## React Component Testing
```typescript
// ✅ Test user behavior, not implementation
describe('LoginForm', () => {
  it('should display error message for invalid credentials', async () => {
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
```

## Mocking Patterns
```typescript
// ✅ Service mocking
const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  validateEmail: jest.fn().mockReturnValue(true),
};

// ✅ Test data factories
const createTestUser = (overrides = {}) => ({
  id: uuid(),
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});
```

## Testing Principles
- **Test behavior, not implementation** - Focus on what users see/do
- **Use descriptive test names** - "should [behavior] when [condition]"
- **Query by user-visible elements** - text, roles, labels over test IDs
- **Keep tests isolated** - Independent and repeatable
- **70% unit, 20% integration, 10% E2E** - Test pyramid

## Running Tests

### Single Test File Execution
```bash
# ✅ Run a specific test file (PREFERRED - Fast & Efficient)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs

# Key Benefits:
# - Only runs the specific test file (fast)
# - No dependency resolution overhead
# - Immediate feedback for test development

# ✅ Examples:
# Frontend tests (use .test.ts extension)
npx jest packages/twenty-front/src/modules/localization/utils/detection/detectNumberFormat.test.ts --config=packages/twenty-front/jest.config.mjs

# Server tests (use .spec.ts extension)
npx jest packages/twenty-server/src/utils/__test__/is-work-email.spec.ts --config=packages/twenty-server/jest.config.mjs

# ❌ AVOID - This runs ALL tests (slow):
npx nx test twenty-front --testPathPattern=detectNumberFormat.test.ts

# ✅ Run tests in watch mode for development:
npx jest path/to/test.test.ts --config=packages/twenty-front/jest.config.mjs --watch

# ✅ Run with coverage for single file:
npx jest path/to/test.test.ts --config=packages/twenty-front/jest.config.mjs --coverage
```

### Test Suite Execution
```bash
# Run all tests for a project (use sparingly)
npx nx test twenty-front
npx nx test twenty-server

# Run tests matching a pattern
npx jest --testNamePattern="UserService" --config=packages/twenty-front/jest.config.mjs
```

## Common Patterns
```typescript
// Async testing
await waitFor(() => {
  expect(screen.getByText('Loading...')).not.toBeInTheDocument();
});

// User interactions
await user.click(screen.getByRole('button'));
await user.type(screen.getByLabelText(/search/i), 'query');

// API integration tests
const response = await request(app)
  .post('/api/users')
  .send(userData)
  .expect(201);
```
