# Code Style Guidelines

## Core Code Style Principles
Twenty emphasizes clean, readable, and maintainable code. This document outlines our code style conventions and best practices.

## Control Flow

### Early Returns
- Use early returns to reduce nesting
- Handle edge cases first
  ```typescript
  // ✅ Correct
  const processUser = (user: User | null) => {
    if (!user) return null;
    if (!user.isActive) return null;
    
    return {
      id: user.id,
      name: user.name,
    };
  };

  // ❌ Incorrect
  const processUser = (user: User | null) => {
    if (user) {
      if (user.isActive) {
        return {
          id: user.id,
          name: user.name,
        };
      }
    }
    return null;
  };
  ```

### No Nested Ternaries
- Avoid nested ternary operators
- Use if statements or early returns
  ```typescript
  // ✅ Correct
  const getUserDisplay = (user: User) => {
    if (!user.name) return 'Anonymous';
    if (!user.isActive) return 'Inactive User';
    return user.name;
  };

  // ❌ Incorrect
  const getUserDisplay = (user: User) => 
    user.name 
      ? user.isActive 
        ? user.name 
        : 'Inactive User'
      : 'Anonymous';
  ```

### No Else-If Chains
- Use switch statements or lookup objects
- Keep conditions flat
  ```typescript
  // ✅ Correct
  const getStatusColor = (status: Status): string => {
    switch (status) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Or using a lookup object
  const statusColors: Record<Status, string> = {
    success: 'green',
    warning: 'yellow',
    error: 'red',
    default: 'gray',
  };

  // ❌ Incorrect
  const getStatusColor = (status: Status): string => {
    if (status === 'success') {
      return 'green';
    } else if (status === 'warning') {
      return 'yellow';
    } else if (status === 'error') {
      return 'red';
    } else {
      return 'gray';
    }
  };
  ```

## Operators and Expressions

### Optional Chaining Over &&
- Use optional chaining for null/undefined checks
- Clearer intent and better type safety
  ```typescript
  // ✅ Correct
  const userName = user?.name;
  const userAddress = user?.address?.street;

  // ❌ Incorrect
  const userName = user && user.name;
  const userAddress = user && user.address && user.address.street;
  ```

## Function Design

### Small Focused Functions
- Keep functions small and single-purpose
- Extract complex logic into helper functions
  ```typescript
  // ✅ Correct
  const validateUser = (user: User) => {
    if (!isValidName(user.name)) return false;
    if (!isValidEmail(user.email)) return false;
    if (!isValidAge(user.age)) return false;
    return true;
  };

  const isValidName = (name: string) => {
    return name.length >= 2 && /^[a-zA-Z\s]*$/.test(name);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidAge = (age: number) => {
    return age >= 18 && age <= 120;
  };

  // ❌ Incorrect
  const validateUser = (user: User) => {
    if (user.name.length < 2 || !/^[a-zA-Z\s]*$/.test(user.name)) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return false;
    if (user.age < 18 || user.age > 120) return false;
    return true;
  };
  ```

## Naming and Documentation

### Clear Variable Names
- Use descriptive, intention-revealing names
- Avoid abbreviations unless common
  ```typescript
  // ✅ Correct
  const isUserActive = user.status === 'active';
  const hasRequiredPermissions = user.permissions.includes('admin');
  const userDisplayName = user.name || 'Anonymous';

  // ❌ Incorrect
  const active = user.status === 'active';
  const hasPerm = user.permissions.includes('admin');
  const udn = user.name || 'Anonymous';
  ```

### No Console.logs in Commits
- Remove all console.logs before committing
- Use proper logging/error tracking in production
  ```typescript
  // ❌ Incorrect - Don't commit these
  console.log('user:', user);
  console.log('debug:', someValue);

  // ✅ Correct - Use proper logging
  logger.info('User action completed', { userId: user.id });
  logger.error('Operation failed', { error });
  ```

### Minimal Comments
- Write self-documenting code
- Use comments only for complex business logic
  ```typescript
  // ✅ Correct
  // Calculate pro-rated amount based on billing cycle
  const calculateProRatedAmount = (amount: number, daysLeft: number, totalDays: number) => {
    return (amount * daysLeft) / totalDays;
  };

  // ❌ Incorrect - Unnecessary comments
  // Get the user's name
  const getUserName = (user: User) => user.name;

  // Check if user is active
  const isUserActive = (user: User) => user.status === 'active';
  ```

## Error Handling

### Proper Error Handling
- Use try-catch blocks appropriately
- Provide meaningful error messages
  ```typescript
  // ✅ Correct
  const fetchUserData = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user data', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UserFetchError('Failed to fetch user data');
    }
  };

  // ❌ Incorrect
  const fetchUserData = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.log('error:', error);
      throw error;
    }
  };
  ```

## Code Organization

### Logical Grouping
- Group related code together
- Maintain consistent organization
  ```typescript
  // ✅ Correct
  class UserService {
    // Properties
    private readonly api: Api;
    private readonly logger: Logger;

    // Constructor
    constructor(api: Api, logger: Logger) {
      this.api = api;
      this.logger = logger;
    }

    // Public methods
    public async getUser(id: string): Promise<User> {
      // Implementation
    }

    public async updateUser(user: User): Promise<User> {
      // Implementation
    }

    // Private helpers
    private validateUser(user: User): boolean {
      // Implementation
    }
  }
  ``` 