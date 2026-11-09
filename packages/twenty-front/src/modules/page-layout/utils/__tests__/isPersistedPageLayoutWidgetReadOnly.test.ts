import { isPersistedPageLayoutWidgetReadOnly } from '@/page-layout/utils/isPersistedPageLayoutWidgetReadOnly';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const THIRD_PARTY_APPLICATION_ID = 'acme-application';

const currentWorkspace = {
  ...mockCurrentWorkspace,
  installedApplications: [
    ...mockCurrentWorkspace.installedApplications,
    {
      ...mockCurrentWorkspace.installedApplications[0],
      id: THIRD_PARTY_APPLICATION_ID,
      universalIdentifier: 'acme',
    },
  ],
};

describe('isPersistedPageLayoutWidgetReadOnly', () => {
  it('should lock a saved widget of a third-party app', () => {
    expect(
      isPersistedPageLayoutWidgetReadOnly({
        persistedWidget: { applicationId: THIRD_PARTY_APPLICATION_ID },
        currentWorkspace,
      }),
    ).toBe(true);
  });

  it('should leave an unsaved widget editable', () => {
    expect(
      isPersistedPageLayoutWidgetReadOnly({
        persistedWidget: undefined,
        currentWorkspace,
      }),
    ).toBe(false);
  });

  it('should leave a saved widget of the workspace editable', () => {
    expect(
      isPersistedPageLayoutWidgetReadOnly({
        persistedWidget: {
          applicationId:
            mockCurrentWorkspace.workspaceCustomApplication?.id ?? '',
        },
        currentWorkspace,
      }),
    ).toBe(false);
  });
});
