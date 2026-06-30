import { describe, expect, it } from 'vitest';

import { isTestOrExampleEmail } from 'src/logic-functions/utils/is-test-or-example-email';

describe('isTestOrExampleEmail', () => {
  it('should return true when the email contains "example"', () => {
    expect(isTestOrExampleEmail('jane@example.com')).toBe(true);
  });

  it('should return true when the email contains "test" regardless of case', () => {
    expect(isTestOrExampleEmail('John.TEST@company.com')).toBe(true);
  });

  it('should return false for a regular email address', () => {
    expect(isTestOrExampleEmail('jane@twenty.com')).toBe(false);
  });
});
