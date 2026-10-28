import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { computeMissingStandardPermissionFlags } from 'src/database/commands/upgrade-version-command/2-53/utils/compute-missing-standard-permission-flags.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { buildStandardFlatPermissionFlagMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag/build-standard-flat-permission-flag-metadata-maps.util';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-0000000000a1';
const OTHER_APPLICATION_ID = '20202020-0000-0000-0000-0000000000b2';
const NOW = '2026-10-27T12:00:00.000Z';

const standardFlatPermissionFlagMaps =
  buildStandardFlatPermissionFlagMetadataMaps({
    now: NOW,
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: STANDARD_APPLICATION_ID,
  });

const standardFlatPermissionFlags = Object.values(
  standardFlatPermissionFlagMaps.byUniversalIdentifier,
).filter(isDefined);

const toFlatPermissionFlagMaps = (
  flatPermissionFlags: FlatPermissionFlag[],
): FlatEntityMaps<FlatPermissionFlag> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatPermissionFlags.map((flatPermissionFlag) => [
        flatPermissionFlag.universalIdentifier,
        { ...flatPermissionFlag, id: `existing-${flatPermissionFlag.key}` },
      ]),
    ),
  }) as FlatEntityMaps<FlatPermissionFlag>;

const withoutKeys = (keys: PermissionFlagType[]) =>
  standardFlatPermissionFlags.filter(
    (standardFlatPermissionFlag) =>
      !keys.includes(standardFlatPermissionFlag.key as PermissionFlagType),
  );

describe('computeMissingStandardPermissionFlags', () => {
  it('creates the standard flag a workspace created before it was added lacks', () => {
    const { permissionFlagsToCreate, permissionFlagsSkippedForKeyClash } =
      computeMissingStandardPermissionFlags({
        standardFlatPermissionFlagMaps,
        existingFlatPermissionFlagMaps: toFlatPermissionFlagMaps(
          withoutKeys([PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL]),
        ),
      });

    expect(permissionFlagsToCreate).toEqual([
      expect.objectContaining({
        key: PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
        universalIdentifier: SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL,
        applicationId: STANDARD_APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        label: 'Create Calendar Event',
        permissionType: 'tool',
      }),
    ]);
    expect(permissionFlagsSkippedForKeyClash).toEqual([]);
  });

  it('creates nothing when the workspace already has every standard flag', () => {
    const { permissionFlagsToCreate, permissionFlagsSkippedForKeyClash } =
      computeMissingStandardPermissionFlags({
        standardFlatPermissionFlagMaps,
        existingFlatPermissionFlagMaps: toFlatPermissionFlagMaps(
          standardFlatPermissionFlags,
        ),
      });

    expect(permissionFlagsToCreate).toEqual([]);
    expect(permissionFlagsSkippedForKeyClash).toEqual([]);
  });

  it('creates every standard flag the workspace lacks, not only the latest one', () => {
    const { permissionFlagsToCreate } = computeMissingStandardPermissionFlags({
      standardFlatPermissionFlagMaps,
      existingFlatPermissionFlagMaps: toFlatPermissionFlagMaps(
        withoutKeys([
          PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
          PermissionFlagType.SEND_EMAIL_TOOL,
        ]),
      ),
    });

    expect(
      permissionFlagsToCreate.map((permissionFlag) => permissionFlag.key),
    ).toEqual(
      expect.arrayContaining([
        PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
        PermissionFlagType.SEND_EMAIL_TOOL,
      ]),
    );
    expect(permissionFlagsToCreate).toHaveLength(2);
  });

  it('skips a standard flag whose key another application already registered', () => {
    const appFlagWithStandardKey = {
      ...standardFlatPermissionFlags.find(
        (standardFlatPermissionFlag) =>
          standardFlatPermissionFlag.key ===
          PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
      ),
      universalIdentifier: '20202020-0000-0000-0000-0000000000c3',
      applicationId: OTHER_APPLICATION_ID,
    } as FlatPermissionFlag;

    const { permissionFlagsToCreate, permissionFlagsSkippedForKeyClash } =
      computeMissingStandardPermissionFlags({
        standardFlatPermissionFlagMaps,
        existingFlatPermissionFlagMaps: toFlatPermissionFlagMaps([
          ...withoutKeys([PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL]),
          appFlagWithStandardKey,
        ]),
      });

    expect(permissionFlagsToCreate).toEqual([]);
    expect(permissionFlagsSkippedForKeyClash).toEqual([
      expect.objectContaining({
        universalIdentifier: SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL,
      }),
    ]);
  });
});
