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
          hasMissingRequiredVariables: wasMissing,
        }),
      ).toBe(shouldRecheck);
    },
  );

  it('does not recheck when the save failed', () => {
    expect(
      shouldRecheckApplicationHealthAfterSave({
        saveResult: { isSaved: false },
        hasMissingRequiredVariables: false,
      }),
    ).toBe(false);
  });
});
