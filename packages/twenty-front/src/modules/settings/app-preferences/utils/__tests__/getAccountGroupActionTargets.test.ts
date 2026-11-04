import { getAccountGroupActionTargets } from '@/settings/app-preferences/utils/getAccountGroupActionTargets';

const ARCHIVED_AT = '2026-10-01T00:00:00.000Z';

const CURRENT_WORKSPACE = {
  installedApplications: [
    {
      id: 'fathom',
      name: 'Fathom',
      universalIdentifier: 'fathom-universal-identifier',
      logoUrl: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  workspaceCustomApplication: null,
};

const buildAccount = ({
  id,
  handle = 'tim@apple.dev',
  applicationId = null,
  archivedAt = null,
}: {
  id: string;
  handle?: string;
  applicationId?: string | null;
  archivedAt?: string | null;
}) => ({ id, handle, applicationId, archivedAt });

describe('getAccountGroupActionTargets', () => {
  it('lists the mailbox by handle first, then each app connection by app name, on disconnect', () => {
    expect(
      getAccountGroupActionTargets({
        group: {
          id: 'google',
          handle: 'tim@apple.dev',
          builtInAccount: buildAccount({ id: 'google' }),
          appAccounts: [
            buildAccount({
              id: 'fathom-connection',
              handle: 'Tim@Apple.dev',
              applicationId: 'fathom',
            }),
          ],
        },
        action: 'disconnect',
        currentWorkspace: CURRENT_WORKSPACE,
      }),
    ).toEqual([
      { id: 'google', label: 'tim@apple.dev' },
      { id: 'fathom-connection', label: 'Fathom' },
    ]);
  });

  const groupWithArchivedConnections = {
    id: 'google',
    handle: 'tim@apple.dev',
    builtInAccount: buildAccount({ id: 'google', archivedAt: ARCHIVED_AT }),
    appAccounts: [
      buildAccount({
        id: 'archived-fathom-connection',
        applicationId: 'fathom',
        archivedAt: ARCHIVED_AT,
      }),
      buildAccount({ id: 'active-fathom-connection', applicationId: 'fathom' }),
    ],
  };

  it('skips archived connections on disconnect', () => {
    expect(
      getAccountGroupActionTargets({
        group: groupWithArchivedConnections,
        action: 'disconnect',
        currentWorkspace: CURRENT_WORKSPACE,
      }),
    ).toEqual([{ id: 'active-fathom-connection', label: 'Fathom' }]);
  });

  it('keeps archived connections on delete', () => {
    expect(
      getAccountGroupActionTargets({
        group: groupWithArchivedConnections,
        action: 'delete',
        currentWorkspace: CURRENT_WORKSPACE,
      }).map(({ id }) => id),
    ).toEqual([
      'google',
      'archived-fathom-connection',
      'active-fathom-connection',
    ]);
  });

  it('labels an app missing from the installed applications as Application in an app-only group', () => {
    expect(
      getAccountGroupActionTargets({
        group: {
          id: 'fathom-connection',
          handle: 'notes@apple.dev',
          appAccounts: [
            buildAccount({
              id: 'fathom-connection',
              handle: 'notes@apple.dev',
              applicationId: 'fathom',
            }),
            buildAccount({
              id: 'uninstalled-connection',
              handle: 'notes@apple.dev',
              applicationId: 'uninstalled',
            }),
          ],
        },
        action: 'delete',
        currentWorkspace: CURRENT_WORKSPACE,
      }),
    ).toEqual([
      { id: 'fathom-connection', label: 'Fathom' },
      { id: 'uninstalled-connection', label: 'Application' },
    ]);
  });
});
