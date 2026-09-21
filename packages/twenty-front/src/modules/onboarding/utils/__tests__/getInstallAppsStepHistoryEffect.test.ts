import { getInstallAppsStepHistoryEffect } from '@/onboarding/utils/getInstallAppsStepHistoryEffect';

describe('getInstallAppsStepHistoryEffect', () => {
  it('should record the step as reversible when the user continued without picking an app', () => {
    expect(
      getInstallAppsStepHistoryEffect({
        universalIdentifiers: [],
        isAutoSkipped: false,
      }),
    ).toBe('recordAsReversible');
  });

  it('should leave the history unchanged when the step was auto-skipped', () => {
    expect(
      getInstallAppsStepHistoryEffect({
        universalIdentifiers: [],
        isAutoSkipped: true,
      }),
    ).toBe('leaveUnchanged');
  });

  it('should clear the history when apps were picked', () => {
    expect(
      getInstallAppsStepHistoryEffect({
        universalIdentifiers: ['call-recorder'],
        isAutoSkipped: false,
      }),
    ).toBe('clearAfterIrreversibleStep');
  });

  it('should clear the history when apps were picked even if the step is flagged as auto-skipped', () => {
    expect(
      getInstallAppsStepHistoryEffect({
        universalIdentifiers: ['call-recorder'],
        isAutoSkipped: true,
      }),
    ).toBe('clearAfterIrreversibleStep');
  });
});
