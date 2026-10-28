import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { IconApps } from 'twenty-ui/icon';

import { useRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useRolePermissionFlagConfig';
import { settingsPermissionFlagDefinitionsState } from '@/settings/roles/states/settingsPermissionFlagDefinitionsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useRolePermissionFlagConfig', () => {
  it('lists an app-defined flag stored under a legacy standard key as its own row', () => {
    resetJotaiStore();
    jotaiStore.set(settingsPermissionFlagDefinitionsState.atom, [
      {
        id: 'standard-workspace-apps',
        applicationId: 'standard-app',
        key: PermissionFlagType.WORKSPACE_APPS,
        label: 'Workspace Apps',
        permissionType: 'settings',
      },
      {
        id: 'custom-applications',
        applicationId: 'custom-app',
        key: 'APPLICATIONS',
        label: 'Custom applications',
        permissionType: 'settings',
      },
    ]);

    const { result } = renderHook(
      () =>
        useRolePermissionFlagConfig({
          permissionType: 'settings',
          standardPermissionsConfig: [
            {
              key: PermissionFlagType.WORKSPACE_APPS,
              name: 'Workspace Apps',
              description: '',
              Icon: IconApps,
            },
          ],
        }),
      { wrapper },
    );

    expect(
      result.current.map(({ key, applicationId }) => ({ key, applicationId })),
    ).toEqual([
      { key: PermissionFlagType.WORKSPACE_APPS, applicationId: 'standard-app' },
      { key: 'APPLICATIONS', applicationId: 'custom-app' },
    ]);
  });
});
