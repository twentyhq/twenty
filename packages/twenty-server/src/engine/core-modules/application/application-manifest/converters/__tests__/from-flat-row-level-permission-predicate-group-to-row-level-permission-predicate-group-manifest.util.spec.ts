import { type RowLevelPermissionPredicateGroupManifest } from 'twenty-shared/application';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-shared/types';

import { fromFlatRowLevelPermissionPredicateGroupToRowLevelPermissionPredicateGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-row-level-permission-predicate-group-to-row-level-permission-predicate-group-manifest.util';
import { fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-group-manifest-to-universal-flat-row-level-permission-predicate-group.util';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const ROLE_UID = '22222222-2222-4222-8222-222222222222';
const OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const PARENT_PREDICATE_GROUP_UID = '44444444-4444-4444-8444-444444444444';
const PREDICATE_GROUP_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-15T10:00:00.000Z';

const PREDICATE_GROUP_MANIFEST: Required<RowLevelPermissionPredicateGroupManifest> =
  {
    universalIdentifier: PREDICATE_GROUP_UID,
    objectUniversalIdentifier: OBJECT_UID,
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
    parentPredicateGroupUniversalIdentifier: PARENT_PREDICATE_GROUP_UID,
    position: 0,
  };

const forward = (
  rowLevelPermissionPredicateGroupManifest: RowLevelPermissionPredicateGroupManifest,
) =>
  fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup(
    {
      rowLevelPermissionPredicateGroupManifest,
      roleUniversalIdentifier: ROLE_UID,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    },
  );

describe('fromFlatRowLevelPermissionPredicateGroupToRowLevelPermissionPredicateGroupManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatRowLevelPermissionPredicateGroupToRowLevelPermissionPredicateGroupManifest(
        {
          flatRowLevelPermissionPredicateGroup: forward(
            PREDICATE_GROUP_MANIFEST,
          ),
        },
      ),
    ).toEqual(PREDICATE_GROUP_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatRowLevelPermissionPredicateGroup: UniversalFlatRowLevelPermissionPredicateGroup =
      {
        ...forward(PREDICATE_GROUP_MANIFEST),
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
        positionInRowLevelPermissionPredicateGroup: 2.5,
      };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatRowLevelPermissionPredicateGroup,
        toUniversalFlatEntity: forward(
          fromFlatRowLevelPermissionPredicateGroupToRowLevelPermissionPredicateGroupManifest(
            { flatRowLevelPermissionPredicateGroup },
          ),
        ),
        metadataName: 'rowLevelPermissionPredicateGroup',
      }),
    ).toBeUndefined();
  });

  it('should omit the parent group and position a flat entity leaves unset', () => {
    const {
      parentPredicateGroupUniversalIdentifier:
        _parentPredicateGroupUniversalIdentifier,
      position: _position,
      ...manifestWithoutOptionalProperties
    } = PREDICATE_GROUP_MANIFEST;

    expect(
      fromFlatRowLevelPermissionPredicateGroupToRowLevelPermissionPredicateGroupManifest(
        {
          flatRowLevelPermissionPredicateGroup: forward(
            manifestWithoutOptionalProperties,
          ),
        },
      ),
    ).toStrictEqual(manifestWithoutOptionalProperties);
  });
});
