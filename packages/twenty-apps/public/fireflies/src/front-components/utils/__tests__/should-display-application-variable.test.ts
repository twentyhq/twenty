import { describe, expect, it } from 'vitest';

import { type FirefliesApplicationVariable } from 'src/front-components/types/fireflies-application-variable.type';
import { shouldDisplayApplicationVariable } from 'src/front-components/utils/should-display-application-variable.util';

const buildVariable = (
  overrides: Partial<FirefliesApplicationVariable>,
): FirefliesApplicationVariable => ({
  key: 'FIREFLIES_API_KEY',
  value: '',
  description: '',
  isSecret: true,
  isDeprecated: false,
  ...overrides,
});

describe('shouldDisplayApplicationVariable', () => {
  it('displays a supported variable without a value', () => {
    expect(shouldDisplayApplicationVariable(buildVariable({}))).toBe(true);
  });

  it('hides a deprecated variable without a value', () => {
    expect(
      shouldDisplayApplicationVariable(buildVariable({ isDeprecated: true })),
    ).toBe(false);
  });

  it('displays a deprecated variable that still holds a value', () => {
    expect(
      shouldDisplayApplicationVariable(
        buildVariable({ isDeprecated: true, value: 'dem********' }),
      ),
    ).toBe(true);
  });
});
