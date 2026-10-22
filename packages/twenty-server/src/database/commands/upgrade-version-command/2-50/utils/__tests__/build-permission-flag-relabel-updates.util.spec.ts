import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { buildPermissionFlagRelabelUpdates } from 'src/database/commands/upgrade-version-command/2-50/utils/build-permission-flag-relabel-updates.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-14T12:00:00.000Z';

const PREVIOUS_PRESENTATIONS = {
  [SystemPermissionFlag.APPLICATIONS]: {
    label: 'Applications',
    description: 'Install and manage applications',
    icon: 'IconApps',
  },
  [SystemPermissionFlag.CONNECTED_ACCOUNTS]: {
    label: 'Sync Account',
    description: 'Sync email and calendar accounts',
    icon: 'IconAt',
  },
};

const NEXT_PRESENTATIONS = {
  [SystemPermissionFlag.APPLICATIONS]: {
    label: 'Workspace Apps',
    description: 'Install and manage workspace apps',
    icon: 'IconApps',
  },
  [SystemPermissionFlag.CONNECTED_ACCOUNTS]: {
    label: 'User Apps',
    description: 'Manage own app preferences and accounts',
    icon: 'IconApps',
  },
};

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-13T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const getStandardPermissionFlag = (
  universalIdentifier: string,
): FlatPermissionFlag => {
  const permissionFlag =
    allFlatEntityMaps.flatPermissionFlagMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  if (!isDefined(permissionFlag)) {
    throw new Error(`Standard permission flag ${universalIdentifier} missing`);
  }

  return permissionFlag;
};

const buildPermissionFlagsByUniversalIdentifier = (
  presentations: typeof PREVIOUS_PRESENTATIONS,
) =>
  Object.fromEntries(
    Object.entries(presentations).map(([universalIdentifier, presentation]) => [
      universalIdentifier,
      {
        ...getStandardPermissionFlag(universalIdentifier),
        ...presentation,
      },
    ]),
  );

describe('buildPermissionFlagRelabelUpdates', () => {
  it('matches the standard application permission flags', () => {
    for (const [universalIdentifier, presentation] of Object.entries(
      NEXT_PRESENTATIONS,
    )) {
      const { label, description, icon } =
        getStandardPermissionFlag(universalIdentifier);

      expect({ label, description, icon }).toEqual(presentation);
    }
  });

  it('relabels Applications and Sync Account on up', () => {
    const updates = buildPermissionFlagRelabelUpdates({
      flatPermissionFlagsByUniversalIdentifier:
        buildPermissionFlagsByUniversalIdentifier(PREVIOUS_PRESENTATIONS),
      now: NOW,
      direction: 'up',
    });

    expect(
      updates.map(({ universalIdentifier, label, description, icon }) => ({
        universalIdentifier,
        label,
        description,
        icon,
      })),
    ).toEqual([
      {
        universalIdentifier: SystemPermissionFlag.APPLICATIONS,
        label: 'Workspace Apps',
        description: 'Install and manage workspace apps',
        icon: 'IconApps',
      },
      {
        universalIdentifier: SystemPermissionFlag.CONNECTED_ACCOUNTS,
        label: 'User Apps',
        description: 'Manage own app preferences and accounts',
        icon: 'IconApps',
      },
    ]);
    expect(updates.every(({ updatedAt }) => updatedAt === NOW)).toBe(true);
  });

  it('restores the previous labels on down', () => {
    const updates = buildPermissionFlagRelabelUpdates({
      flatPermissionFlagsByUniversalIdentifier:
        buildPermissionFlagsByUniversalIdentifier(NEXT_PRESENTATIONS),
      now: NOW,
      direction: 'down',
    });

    expect(
      updates.map(({ label, description, icon }) => ({
        label,
        description,
        icon,
      })),
    ).toEqual([
      {
        label: 'Applications',
        description: 'Install and manage applications',
        icon: 'IconApps',
      },
      {
        label: 'Sync Account',
        description: 'Sync email and calendar accounts',
        icon: 'IconAt',
      },
    ]);
  });

  it('skips permission flags already relabeled', () => {
    expect(
      buildPermissionFlagRelabelUpdates({
        flatPermissionFlagsByUniversalIdentifier:
          buildPermissionFlagsByUniversalIdentifier(NEXT_PRESENTATIONS),
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });

  it('skips permission flags owned by another application', () => {
    const permissionFlagsByUniversalIdentifier =
      buildPermissionFlagsByUniversalIdentifier(PREVIOUS_PRESENTATIONS);

    expect(
      buildPermissionFlagRelabelUpdates({
        flatPermissionFlagsByUniversalIdentifier: Object.fromEntries(
          Object.entries(permissionFlagsByUniversalIdentifier).map(
            ([universalIdentifier, permissionFlag]) => [
              universalIdentifier,
              {
                ...permissionFlag,
                applicationUniversalIdentifier:
                  '20202020-3333-4333-8333-333333333333',
              },
            ],
          ),
        ),
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });

  it('skips workspaces without the permission flags', () => {
    expect(
      buildPermissionFlagRelabelUpdates({
        flatPermissionFlagsByUniversalIdentifier: {},
        now: NOW,
        direction: 'up',
      }),
    ).toEqual([]);
  });
});
