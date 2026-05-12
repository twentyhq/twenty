import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-group-manifest-to-universal-flat-row-level-permission-predicate-group.util';
import { fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-manifest-to-universal-flat-row-level-permission-predicate.util';

describe('row level permission manifest converters', () => {
  const now = '2026-05-11T00:00:00.000Z';
  const applicationUniversalIdentifier = 'ce8ec254-f99a-4e12-b23c-8ea97880a30b';
  const roleUniversalIdentifier = 'f9d06652-db4d-51d0-84ff-b4e233934ed4';
  const objectUniversalIdentifier = '38339ab2-f00b-416c-8ee0-806b48caca18';
  const fieldUniversalIdentifier = 'dd14cab4-0829-4475-a794-d0d4959161e6';
  const groupUniversalIdentifier = 'cb8407cb-35c3-5336-becf-58995b35582b';

  it('converts predicate groups to universal flat metadata', () => {
    const result =
      fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup(
        {
          predicateGroupManifest: {
            universalIdentifier: groupUniversalIdentifier,
            objectUniversalIdentifier,
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          },
          roleUniversalIdentifier,
          applicationUniversalIdentifier,
          now,
        },
      );

    expect(result).toMatchObject({
      universalIdentifier: groupUniversalIdentifier,
      applicationUniversalIdentifier,
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
      childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      deletedAt: null,
    });
  });

  it('converts predicates to universal flat metadata', () => {
    const result =
      fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate(
        {
          predicateManifest: {
            universalIdentifier: '1d2fe188-5d9a-5a5e-b44f-b95e26bce132',
            objectUniversalIdentifier,
            fieldUniversalIdentifier,
            operand: RowLevelPermissionPredicateOperand.IS,
            value: {
              isCurrentWorkspaceMemberSelected: true,
              selectedRecordIds: [],
            },
            rowLevelPermissionPredicateGroupUniversalIdentifier:
              groupUniversalIdentifier,
            positionInRowLevelPermissionPredicateGroup: 0,
          },
          roleUniversalIdentifier,
          applicationUniversalIdentifier,
          now,
        },
      );

    expect(result).toMatchObject({
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
      operand: RowLevelPermissionPredicateOperand.IS,
      rowLevelPermissionPredicateGroupUniversalIdentifier:
        groupUniversalIdentifier,
      positionInRowLevelPermissionPredicateGroup: 0,
      workspaceMemberFieldMetadataUniversalIdentifier: null,
      deletedAt: null,
    });
  });
});
