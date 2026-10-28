import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { buildAppPermissionFlagKeyRenames } from 'src/database/commands/upgrade-version-command/2-53/utils/build-app-permission-flag-key-renames.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';

const USER_APPS_UNIVERSAL_IDENTIFIER = 'e5f63b2d-5369-5df6-8f32-a8bd9e79e653';

const WORKSPACE_APPS_UNIVERSAL_IDENTIFIER =
  '9faa55f7-2606-566b-9e1d-aefbedbd0136';

const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';

const buildPermissionFlag = ({
  universalIdentifier,
  key,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  universalIdentifier: string;
  key: string;
  applicationUniversalIdentifier?: string;
}): FlatPermissionFlag =>
  ({
    id: `id-${universalIdentifier}`,
    universalIdentifier,
    key,
    applicationUniversalIdentifier,
  }) as FlatPermissionFlag;

const indexByUniversalIdentifier = (permissionFlags: FlatPermissionFlag[]) =>
  Object.fromEntries(
    permissionFlags.map((permissionFlag) => [
      permissionFlag.universalIdentifier,
      permissionFlag,
    ]),
  );

const PREVIOUS_STANDARD_PERMISSION_FLAGS = [
  buildPermissionFlag({
    universalIdentifier: USER_APPS_UNIVERSAL_IDENTIFIER,
    key: 'CONNECTED_ACCOUNTS',
  }),
  buildPermissionFlag({
    universalIdentifier: WORKSPACE_APPS_UNIVERSAL_IDENTIFIER,
    key: 'APPLICATIONS',
  }),
];

const NEXT_STANDARD_PERMISSION_FLAGS = [
  buildPermissionFlag({
    universalIdentifier: USER_APPS_UNIVERSAL_IDENTIFIER,
    key: 'USER_APPS',
  }),
  buildPermissionFlag({
    universalIdentifier: WORKSPACE_APPS_UNIVERSAL_IDENTIFIER,
    key: 'WORKSPACE_APPS',
  }),
];

describe('buildAppPermissionFlagKeyRenames', () => {
  it('renames CONNECTED_ACCOUNTS and APPLICATIONS on up', () => {
    expect(
      buildAppPermissionFlagKeyRenames({
        flatPermissionFlagsByUniversalIdentifier: indexByUniversalIdentifier(
          PREVIOUS_STANDARD_PERMISSION_FLAGS,
        ),
        direction: 'up',
      }),
    ).toEqual({
      permissionFlagKeyRenames: [
        {
          permissionFlagId: `id-${USER_APPS_UNIVERSAL_IDENTIFIER}`,
          universalIdentifier: USER_APPS_UNIVERSAL_IDENTIFIER,
          fromKey: 'CONNECTED_ACCOUNTS',
          toKey: 'USER_APPS',
        },
        {
          permissionFlagId: `id-${WORKSPACE_APPS_UNIVERSAL_IDENTIFIER}`,
          universalIdentifier: WORKSPACE_APPS_UNIVERSAL_IDENTIFIER,
          fromKey: 'APPLICATIONS',
          toKey: 'WORKSPACE_APPS',
        },
      ],
      permissionFlagKeyCollisions: [],
    });
  });

  it('restores the previous keys on down', () => {
    const { permissionFlagKeyRenames } = buildAppPermissionFlagKeyRenames({
      flatPermissionFlagsByUniversalIdentifier: indexByUniversalIdentifier(
        NEXT_STANDARD_PERMISSION_FLAGS,
      ),
      direction: 'down',
    });

    expect(
      permissionFlagKeyRenames.map(({ fromKey, toKey }) => ({
        fromKey,
        toKey,
      })),
    ).toEqual([
      { fromKey: 'USER_APPS', toKey: 'CONNECTED_ACCOUNTS' },
      { fromKey: 'WORKSPACE_APPS', toKey: 'APPLICATIONS' },
    ]);
  });

  it('skips permission flags already renamed', () => {
    expect(
      buildAppPermissionFlagKeyRenames({
        flatPermissionFlagsByUniversalIdentifier: indexByUniversalIdentifier(
          NEXT_STANDARD_PERMISSION_FLAGS,
        ),
        direction: 'up',
      }),
    ).toEqual({
      permissionFlagKeyRenames: [],
      permissionFlagKeyCollisions: [],
    });
  });

  it('skips permission flags owned by another application', () => {
    expect(
      buildAppPermissionFlagKeyRenames({
        flatPermissionFlagsByUniversalIdentifier: indexByUniversalIdentifier(
          PREVIOUS_STANDARD_PERMISSION_FLAGS.map((permissionFlag) => ({
            ...permissionFlag,
            applicationUniversalIdentifier:
              OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
          })),
        ),
        direction: 'up',
      }),
    ).toEqual({
      permissionFlagKeyRenames: [],
      permissionFlagKeyCollisions: [],
    });
  });

  it('skips workspaces without the permission flags', () => {
    expect(
      buildAppPermissionFlagKeyRenames({
        flatPermissionFlagsByUniversalIdentifier: {},
        direction: 'up',
      }),
    ).toEqual({
      permissionFlagKeyRenames: [],
      permissionFlagKeyCollisions: [],
    });
  });

  it('reports a collision instead of a rename when another flag already holds the new key', () => {
    const conflictingPermissionFlag = buildPermissionFlag({
      universalIdentifier: '20202020-4444-4444-8444-444444444444',
      key: 'USER_APPS',
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    const { permissionFlagKeyRenames, permissionFlagKeyCollisions } =
      buildAppPermissionFlagKeyRenames({
        flatPermissionFlagsByUniversalIdentifier: indexByUniversalIdentifier([
          ...PREVIOUS_STANDARD_PERMISSION_FLAGS,
          conflictingPermissionFlag,
        ]),
        direction: 'up',
      });

    expect(permissionFlagKeyCollisions).toEqual([
      {
        permissionFlagId: `id-${USER_APPS_UNIVERSAL_IDENTIFIER}`,
        universalIdentifier: USER_APPS_UNIVERSAL_IDENTIFIER,
        fromKey: 'CONNECTED_ACCOUNTS',
        toKey: 'USER_APPS',
        conflictingPermissionFlag,
      },
    ]);
    expect(permissionFlagKeyRenames.map(({ toKey }) => toKey)).toEqual([
      'WORKSPACE_APPS',
    ]);
  });
});
