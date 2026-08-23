import { isTimelineActivityTypeResetAllowed } from '~/pages/settings/applications/utils/isTimelineActivityTypeResetAllowed';

describe('isTimelineActivityTypeResetAllowed', () => {
  it('allows reset for an installed application with manifest defaults', () => {
    expect(
      isTimelineActivityTypeResetAllowed({
        applicationId: 'installed-application-id',
        workspaceCustomApplicationId: 'custom-application-id',
      }),
    ).toBe(true);
  });

  it('disallows reset for the workspace custom application', () => {
    expect(
      isTimelineActivityTypeResetAllowed({
        applicationId: 'custom-application-id',
        workspaceCustomApplicationId: 'custom-application-id',
      }),
    ).toBe(false);
  });

  it('disallows reset while the workspace custom application is unavailable', () => {
    expect(
      isTimelineActivityTypeResetAllowed({
        applicationId: 'installed-application-id',
      }),
    ).toBe(false);
  });
});
