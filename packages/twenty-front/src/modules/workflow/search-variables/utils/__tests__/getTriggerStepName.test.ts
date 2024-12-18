import { getTriggerStepName } from '../getTriggerStepName';

it('returns the expected name for a DATABASE_EVENT trigger', () => {
  expect(
    getTriggerStepName({
      type: 'DATABASE_EVENT',
      name: '',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    }),
  ).toBe('Company is Created');
});

it('returns the expected name for a MANUAL trigger without a defined objectType', () => {
  expect(
    getTriggerStepName({
      type: 'MANUAL',
      name: '',
      settings: {
        objectType: undefined,
        outputSchema: {},
      },
    }),
  ).toBe('Manual trigger');
});

it('returns the expected name for a MANUAL trigger with a defined objectType', () => {
  expect(
    getTriggerStepName({
      type: 'MANUAL',
      name: '',
      settings: {
        objectType: 'company',
        outputSchema: {},
      },
    }),
  ).toBe('Manual trigger for Company');
});

it('throws when an unknown trigger type is provided', () => {
  expect(() => {
    getTriggerStepName({
      type: 'unknown' as any,
      name: '',
      settings: {
        objectType: 'company',
        outputSchema: {},
      },
    });
  }).toThrow();
});
