import { describe, expect, it } from 'vitest';

import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { shouldDisplayApplicationVariable } from 'src/front-components/utils/should-display-application-variable.util';

const buildVariable = (
  overrides: Partial<CallRecorderApplicationVariable> = {},
): CallRecorderApplicationVariable => ({
  key: 'CALL_RECORDER_NAME',
  label: 'Recorder name',
  value: '',
  description: '',
  isSecret: false,
  isDeprecated: false,
  type: 'TEXT',
  options: null,
  ...overrides,
});

describe('shouldDisplayApplicationVariable', () => {
  it('displays a variable that is not deprecated', () => {
    expect(shouldDisplayApplicationVariable(buildVariable())).toBe(true);
  });

  it('hides a deprecated variable without a value', () => {
    expect(
      shouldDisplayApplicationVariable(buildVariable({ isDeprecated: true })),
    ).toBe(false);
  });

  it('displays a deprecated variable that still holds a value', () => {
    expect(
      shouldDisplayApplicationVariable(
        buildVariable({ isDeprecated: true, value: 'Twenty Notetaker' }),
      ),
    ).toBe(true);
  });
});
