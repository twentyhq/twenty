import { type RowLevelPermissionPredicateManifest } from 'twenty-shared/application';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-row-level-permission-predicate-to-row-level-permission-predicate-manifest.util';
import { fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-manifest-to-universal-flat-row-level-permission-predicate.util';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const ROLE_UID = '22222222-2222-4222-8222-222222222222';
const OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const FIELD_UID = '44444444-4444-4444-8444-444444444444';
const WORKSPACE_MEMBER_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const PREDICATE_GROUP_UID = '66666666-6666-4666-8666-666666666666';
const PREDICATE_UID = '77777777-7777-4777-8777-777777777777';
const NOW = '2026-09-15T10:00:00.000Z';

const PREDICATE_MANIFEST: Required<RowLevelPermissionPredicateManifest> = {
  universalIdentifier: PREDICATE_UID,
  objectUniversalIdentifier: OBJECT_UID,
  fieldUniversalIdentifier: FIELD_UID,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: {
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  },
  subFieldName: 'primaryEmail',
  workspaceMemberFieldUniversalIdentifier: WORKSPACE_MEMBER_FIELD_UID,
  workspaceMemberSubFieldName: 'primaryEmail',
  predicateGroupUniversalIdentifier: PREDICATE_GROUP_UID,
  position: 0,
};

const forward = (
  rowLevelPermissionPredicateManifest: RowLevelPermissionPredicateManifest,
) =>
  fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate(
    {
      rowLevelPermissionPredicateManifest,
      roleUniversalIdentifier: ROLE_UID,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    },
  );

describe('fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest({
        flatRowLevelPermissionPredicate: forward(PREDICATE_MANIFEST),
      }),
    ).toEqual(PREDICATE_MANIFEST);
  });

  it.each([
    ['a string', 'bug'],
    ['a JSON string', '{"selectedRecordIds":["record-id"]}'],
    ['an array', ['open', 'closed']],
    ['false', false],
    ['zero', 0],
    ['an empty string', ''],
  ])('should keep a value that is %s', (_description, value) => {
    expect(
      fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest({
        flatRowLevelPermissionPredicate: forward({
          ...PREDICATE_MANIFEST,
          value,
        }),
      }).value,
    ).toStrictEqual(value);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatRowLevelPermissionPredicate: UniversalFlatRowLevelPermissionPredicate =
      {
        ...forward(PREDICATE_MANIFEST),
        value: null,
        subFieldName: null,
        workspaceMemberFieldMetadataUniversalIdentifier: null,
        workspaceMemberSubFieldName: null,
        rowLevelPermissionPredicateGroupUniversalIdentifier: null,
        positionInRowLevelPermissionPredicateGroup: 1.5,
      };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatRowLevelPermissionPredicate,
        toUniversalFlatEntity: forward(
          fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest(
            { flatRowLevelPermissionPredicate },
          ),
        ),
        metadataName: 'rowLevelPermissionPredicate',
      }),
    ).toBeUndefined();
  });

  it('should omit the properties a flat entity leaves unset', () => {
    const {
      value: _value,
      subFieldName: _subFieldName,
      workspaceMemberFieldUniversalIdentifier:
        _workspaceMemberFieldUniversalIdentifier,
      workspaceMemberSubFieldName: _workspaceMemberSubFieldName,
      predicateGroupUniversalIdentifier: _predicateGroupUniversalIdentifier,
      position: _position,
      ...manifestWithoutOptionalProperties
    } = PREDICATE_MANIFEST;

    expect(
      fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest({
        flatRowLevelPermissionPredicate: forward(
          manifestWithoutOptionalProperties,
        ),
      }),
    ).toStrictEqual(manifestWithoutOptionalProperties);
  });
});
