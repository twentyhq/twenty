import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { isPageLayoutFilterBoundByReadOnlyWidget } from '@/page-layout/utils/isPageLayoutFilterBoundByReadOnlyWidget';
import { TEST_BAR_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';

const THIRD_PARTY_APPLICATION_ID = 'acme-application';
const WORKSPACE_APPLICATION_ID = 'workspace-application';
const PERIOD_FILTER_ID = 'period-filter';

const CURRENT_WORKSPACE = {
  workspaceCustomApplication: { id: WORKSPACE_APPLICATION_ID },
  installedApplications: [
    { id: THIRD_PARTY_APPLICATION_ID, universalIdentifier: 'acme' },
    { id: WORKSPACE_APPLICATION_ID, universalIdentifier: 'workspace' },
  ],
} as Pick<
  CurrentWorkspace,
  'installedApplications' | 'workspaceCustomApplication'
>;

const buildPersistedWidget = ({
  applicationId,
  fieldMetadataId,
}: {
  applicationId: string;
  fieldMetadataId?: string | null;
}) => ({
  applicationId,
  configuration: {
    ...TEST_BAR_CHART_CONFIGURATION,
    dashboardFilterBindings:
      fieldMetadataId === undefined
        ? null
        : [{ pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId }],
  },
});

const isBound = (persistedWidgets: ReturnType<typeof buildPersistedWidget>[]) =>
  isPageLayoutFilterBoundByReadOnlyWidget({
    pageLayoutFilterId: PERIOD_FILTER_ID,
    persistedWidgets,
    currentWorkspace: CURRENT_WORKSPACE,
  });

describe('isPageLayoutFilterBoundByReadOnlyWidget', () => {
  it('should be true when a third-party app widget excludes or overrides the filter', () => {
    expect(
      isBound([
        buildPersistedWidget({
          applicationId: THIRD_PARTY_APPLICATION_ID,
          fieldMetadataId: null,
        }),
      ]),
    ).toBe(true);
    expect(
      isBound([
        buildPersistedWidget({
          applicationId: THIRD_PARTY_APPLICATION_ID,
          fieldMetadataId: 'close-date-field',
        }),
      ]),
    ).toBe(true);
  });

  it('should be false when the third-party app widget has no entry for the filter', () => {
    expect(
      isBound([
        buildPersistedWidget({ applicationId: THIRD_PARTY_APPLICATION_ID }),
      ]),
    ).toBe(false);
  });

  it('should be false when only workspace widgets are bound', () => {
    expect(
      isBound([
        buildPersistedWidget({
          applicationId: WORKSPACE_APPLICATION_ID,
          fieldMetadataId: null,
        }),
      ]),
    ).toBe(false);
  });
});
