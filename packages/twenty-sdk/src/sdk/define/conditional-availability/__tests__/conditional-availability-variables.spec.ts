import { CONDITIONAL_AVAILABILITY_VARIABLE_NAMES } from '@/sdk/define/conditional-availability/conditional-availability-variable-names';
import * as conditionalAvailabilityVariables from '@/sdk/define/conditional-availability/conditional-availability-variables';

describe('conditional-availability-variables', () => {
  it('should not throw when the module is imported', () => {
    expect(conditionalAvailabilityVariables.objectMetadataItem).toBeDefined();
  });

  it('should throw on property access of a context variable', () => {
    expect(
      () =>
        (
          conditionalAvailabilityVariables.objectMetadataItem as unknown as {
            nameSingular: string;
          }
        ).nameSingular,
    ).toThrow('conditionalAvailabilityExpression');
  });

  it('should throw on primitive coercion of a context variable', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void (conditionalAvailabilityVariables.numberOfSelectedRecords >= 2);
    }).toThrow('conditionalAvailabilityExpression');
  });

  it('should throw when an operator is called at runtime', () => {
    expect(() => conditionalAvailabilityVariables.isDefined('value')).toThrow(
      'conditionalAvailabilityExpression',
    );
  });

  it('should mention the variable name in the error', () => {
    expect(() =>
      conditionalAvailabilityVariables.everyEquals([], 'prop', true),
    ).toThrow('everyEquals');
  });

  it('should report its own export name in the runtime error for every variable', () => {
    for (const [name, value] of Object.entries(
      conditionalAvailabilityVariables,
    )) {
      expect(() => (value as unknown as () => void)()).toThrow(name);
    }
  });

  // Drift guard: every exported variable must be listed in the shared constant
  // so the build-time guard can never miss a newly added variable.
  it('should keep CONDITIONAL_AVAILABILITY_VARIABLE_NAMES in sync with the exports', () => {
    const exportedNames = Object.keys(conditionalAvailabilityVariables);

    expect(new Set(CONDITIONAL_AVAILABILITY_VARIABLE_NAMES)).toEqual(
      new Set(exportedNames),
    );
  });
});
