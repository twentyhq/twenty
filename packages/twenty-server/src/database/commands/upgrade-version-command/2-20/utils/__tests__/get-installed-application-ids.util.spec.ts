import { getInstalledApplicationIds } from 'src/database/commands/upgrade-version-command/2-20/utils/get-installed-application-ids.util';

const TWENTY_STANDARD_APPLICATION_ID = 'twenty-standard-application-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';

describe('getInstalledApplicationIds', () => {
  it('returns every application that is neither standard nor workspace-custom', () => {
    const installedApplicationIds = getInstalledApplicationIds({
      applicationIds: [
        TWENTY_STANDARD_APPLICATION_ID,
        WORKSPACE_CUSTOM_APPLICATION_ID,
        'installed-application-a-id',
        'installed-application-b-id',
      ],
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    });

    expect(installedApplicationIds).toEqual(
      new Set(['installed-application-a-id', 'installed-application-b-id']),
    );
  });

  it('returns an empty set when only standard and workspace-custom applications exist', () => {
    const installedApplicationIds = getInstalledApplicationIds({
      applicationIds: [
        TWENTY_STANDARD_APPLICATION_ID,
        WORKSPACE_CUSTOM_APPLICATION_ID,
      ],
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
      workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    });

    expect(installedApplicationIds.size).toBe(0);
  });
});
