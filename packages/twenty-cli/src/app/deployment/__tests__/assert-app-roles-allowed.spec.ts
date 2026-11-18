import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  assertAppRolesAllowedOnTargetOrThrow,
  assertMarketplaceAppRolesOrThrow,
} from '@/app/deployment/assert-app-roles-allowed';
import { fetchWorkspaceOrThrow } from '@/app/fetch-workspace-or-throw';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

vi.mock('@/app/fetch-workspace-or-throw', () => ({
  fetchWorkspaceOrThrow: vi.fn(),
}));

const APP_ID = '20202020-0000-4000-8000-000000000001';

const buildWithRoles = (roles: unknown[]): ToolingBuild => ({
  buildId: 'build-id',
  contentHash: 'hash',
  application: { universalIdentifier: APP_ID, name: 'app', displayName: 'App' },
  manifestFormat: 'twenty-application',
  manifest: {
    application: {
      universalIdentifier: APP_ID,
      defaultRoleUniversalIdentifier: 'requested-role',
    },
    roles,
    agents: [],
  },
  files: [],
});

const REQUESTED_ROLE = {
  universalIdentifier: 'requested-role',
  label: 'Requested',
};
const STANDALONE_ROLE = { universalIdentifier: 'member-role', label: 'Member' };
const target = { apiUrl: 'http://localhost:3000' } as ResolvedTarget;
const signal = new AbortController().signal;

describe('assertMarketplaceAppRolesOrThrow', () => {
  it('accepts an app with only its application role', () => {
    expect(() =>
      assertMarketplaceAppRolesOrThrow({
        build: buildWithRoles([REQUESTED_ROLE]),
      }),
    ).not.toThrow();
  });

  it('refuses a standalone role', () => {
    expect(() =>
      assertMarketplaceAppRolesOrThrow({
        build: buildWithRoles([REQUESTED_ROLE, STANDALONE_ROLE]),
      }),
    ).toThrow(/Role "Member" \(member-role\) is neither the application role/);
  });

  it('refuses field permissions on the application role', () => {
    expect(() =>
      assertMarketplaceAppRolesOrThrow({
        build: buildWithRoles([
          {
            ...REQUESTED_ROLE,
            recordsPermissions: {
              objects: [
                {
                  objectUniversalIdentifier: 'company',
                  uneditableFields: ['secret'],
                },
              ],
            },
          },
        ]),
      }),
    ).toThrow(/declares field permissions on objects company/);
  });
});

describe('assertAppRolesAllowedOnTargetOrThrow', () => {
  beforeEach(() => {
    vi.mocked(fetchWorkspaceOrThrow).mockReset();
  });

  it('does not ask the workspace when the app declares nothing restricted', async () => {
    await assertAppRolesAllowedOnTargetOrThrow({
      build: buildWithRoles([REQUESTED_ROLE]),
      target,
      signal,
    });

    expect(fetchWorkspaceOrThrow).not.toHaveBeenCalled();
  });

  it('accepts restricted roles on the workspace custom app', async () => {
    vi.mocked(fetchWorkspaceOrThrow).mockResolvedValue({
      id: 'workspace-id',
      workspaceCustomApplication: { universalIdentifier: APP_ID.toUpperCase() },
    } as Awaited<ReturnType<typeof fetchWorkspaceOrThrow>>);

    await expect(
      assertAppRolesAllowedOnTargetOrThrow({
        build: buildWithRoles([REQUESTED_ROLE, STANDALONE_ROLE]),
        target,
        signal,
      }),
    ).resolves.toBeUndefined();
  });

  it('refuses restricted roles on any other app', async () => {
    vi.mocked(fetchWorkspaceOrThrow).mockResolvedValue({
      id: 'workspace-id',
      workspaceCustomApplication: {
        universalIdentifier: '20202020-0000-4000-8000-000000000002',
      },
    } as Awaited<ReturnType<typeof fetchWorkspaceOrThrow>>);

    await expect(
      assertAppRolesAllowedOnTargetOrThrow({
        build: buildWithRoles([REQUESTED_ROLE, STANDALONE_ROLE]),
        target,
        signal,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
});
