# Testing Guidelines

## Core Testing Principles
Twenty follows a comprehensive testing strategy across all packages, ensuring high-quality, maintainable code. This document outlines our testing conventions and best practices.

## Testing Stack

### Backend Testing
- Primary Framework: Jest
- API Testing: Supertest
- Coverage Requirements: 80% minimum

### Frontend Testing
- Component Testing: Jest + React Testing Library
- Visual Testing: Storybook
- API Mocking: MSW (Mock Service Worker)

### End-to-End Testing
- Framework: Playwright
- Coverage: Critical user journeys
- Cross-browser testing

## Test Organization

### Test File Location
- Co-locate tests with implementation files
- Use consistent naming patterns
  ```
  src/
  ├── components/
  │   ├── UserProfile.tsx
  │   ├── UserProfile.test.tsx
  │   └── UserProfile.stories.tsx
  ```

### Test File Naming
- Use `.test.ts(x)` for unit/integration tests
- Use `.spec.ts(x)` for E2E tests
- Use `.stories.tsx` for Storybook stories

## Unit Testing

### Component Testing
- Test behavior, not implementation
- Use React Testing Library best practices
  ```typescript
  // ✅ Correct
  test('displays user name when provided', () => {
    render(<UserProfile user={{ name: 'John Doe' }} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  // ❌ Incorrect - Testing implementation details
  test('sets the text content', () => {
    const { container } = render(<UserProfile user={{ name: 'John Doe' }} />);
    expect(container.querySelector('h1').textContent).toBe('John Doe');
  });
  ```

### Hook Testing
- Use `renderHook` from @testing-library/react-hooks
- Test all possible states
  ```typescript
  // ✅ Correct
  test('useUser hook manages user state', () => {
    const { result } = renderHook(() => useUser());
    
    act(() => {
      result.current.setUser({ id: '1', name: 'John' });
    });
    
    expect(result.current.user).toEqual({ id: '1', name: 'John' });
  });
  ```

### Mocking
- Mock external dependencies
- Use jest.mock for module mocking
  ```typescript
  // ✅ Correct
  jest.mock('~/services/api', () => ({
    fetchUser: jest.fn().mockResolvedValue({ id: '1', name: 'John' }),
  }));

  test('fetches and displays user', async () => {
    render(<UserProfile userId="1" />);
    expect(await screen.findByText('John')).toBeInTheDocument();
  });
  ```

## Integration Testing

### API Testing
- Test complete request/response cycles
- Use Supertest for backend API testing
  ```typescript
  // ✅ Correct
  describe('GET /api/users/:id', () => {
    it('returns user when found', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);
      
      expect(response.body).toEqual({
        id: '1',
        name: 'John Doe',
      });
    });

    it('returns 404 when user not found', async () => {
      await request(app)
        .get('/api/users/999')
        .expect(404);
    });
  });
  ```

## E2E Testing

### Test Structure
- Organize by user journey
- Use page objects for reusability
  ```typescript
  // pages/login.ts
  export class LoginPage {
    async login(email: string, password: string) {
      await this.page.fill('[data-testid="email-input"]', email);
      await this.page.fill('[data-testid="password-input"]', password);
      await this.page.click('[data-testid="login-button"]');
    }
  }

  // tests/auth.spec.ts
  test('user can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('user@example.com', 'password');
    await expect(page).toHaveURL('/dashboard');
  });
  ```

### Test Data
- Use dedicated test environments
- Reset state between tests
  ```typescript
  // ✅ Correct
  beforeEach(async () => {
    await resetDatabase();
    await seedTestData();
  });

  test('user workflow', async ({ page }) => {
    // Test with clean, predictable state
  });
  ```

## Visual Testing

### Storybook Guidelines
- Create stories for all components
- Document component variants
  ```typescript
  // Button.stories.tsx
  export default {
    title: 'Components/Button',
    component: Button,
  } as Meta;

  export const Primary = {
    args: {
      variant: 'primary',
      label: 'Primary Button',
    },
  };

  export const Secondary = {
    args: {
      variant: 'secondary',
      label: 'Secondary Button',
    },
  };
  ```

### Visual Regression
- Use Storybook's visual regression testing
- Review changes carefully
  ```typescript
  // jest.config.js
  module.exports = {
    preset: 'jest-image-snapshot',
    setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
  };

  // Button.visual.test.tsx
  describe('Button', () => {
    it('matches visual snapshot', async () => {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot();
    });
  });
  ```

## Test Quality

### Test Data Attributes
- Use data-testid for test selectors
- Avoid selecting by CSS classes
  ```typescript
  // ✅ Correct
  <button data-testid="submit-button">Submit</button>

  // In tests
  const button = screen.getByTestId('submit-button');

  // ❌ Incorrect
  const button = container.querySelector('.submit-btn');
  ```

### Assertion Best Practices
- Use explicit assertions
- Test both positive and negative cases
  ```typescript
  // ✅ Correct
  test('form validation', async () => {
    render(<UserForm />);
    
    // Negative case
    await userEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    
    // Positive case
    await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    await userEvent.click(screen.getByText('Submit'));
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });
  ```

### Coverage Requirements
- A new feature should have at least 80% coverage
- Focus on critical paths
- Run coverage reports in CI
  ```typescript
  // jest.config.js
  module.exports = {
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  };
  ``` 