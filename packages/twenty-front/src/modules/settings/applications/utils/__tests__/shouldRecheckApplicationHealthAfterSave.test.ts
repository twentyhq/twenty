import { shouldRecheckApplicationHealthAfterSave } from '@/settings/applications/utils/shouldRecheckApplicationHealthAfterSave';

describe('shouldRecheckApplicationHealthAfterSave', () => {
  it.each([
    { wasMissing: false, isMissing: false, shouldRecheck: true },
    { wasMissing: false, isMissing: true, shouldRecheck: false },
    { wasMissing: true, isMissing: false, shouldRecheck: false },
    { wasMissing: true, isMissing: true, shouldRecheck: false },
  ])(
    'gates a successful save from missing=$wasMissing to missing=$isMissing',
    ({ wasMissing, isMissing, shouldRecheck }) => {
      expect(
        shouldRecheckApplicationHealthAfterSave({
          saveResult: { isSaved: true, hasMissingRequiredVariables: isMissing },
          hasHealthCheck: true,
          hasMissingRequiredVariables: wasMissing,
        }),
      ).toBe(shouldRecheck);
    },
  );

  it.each([
    {
      reason: 'the save failed',
      isSaved: false,
      hasHealthCheck: true,
      hasMissingRequiredVariables: false,
    },
    {
      reason: 'the app declares no health check',
      isSaved: true,
      hasHealthCheck: false,
      hasMissingRequiredVariables: false,
    },
  ])(
    'does not recheck when $reason',
    ({ isSaved, hasHealthCheck, hasMissingRequiredVariables }) => {
      expect(
        shouldRecheckApplicationHealthAfterSave({
          saveResult: isSaved
            ? { isSaved: true, hasMissingRequiredVariables: false }
            : { isSaved: false },
          hasHealthCheck,
          hasMissingRequiredVariables,
        }),
      ).toBe(false);
    },
  );
});
