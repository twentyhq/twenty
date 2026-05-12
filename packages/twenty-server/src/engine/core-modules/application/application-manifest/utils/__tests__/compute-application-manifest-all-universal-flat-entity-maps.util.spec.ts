import { type Manifest } from 'twenty-shared/application';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { computeApplicationManifestAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/compute-application-manifest-all-universal-flat-entity-maps.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

describe('computeApplicationManifestAllUniversalFlatEntityMaps', () => {
  it('includes row level permission metadata from role manifests', () => {
    const manifest: Manifest = {
      application: {
        universalIdentifier: 'ce8ec254-f99a-4e12-b23c-8ea97880a30b',
        displayName: 'XO Pure CRM',
        description: 'Test application',
        defaultRoleUniversalIdentifier: 'f9d06652-db4d-51d0-84ff-b4e233934ed4',
        packageJsonChecksum: null,
        yarnLockChecksum: null,
      },
      commandMenuItems: [],
      objects: [],
      fields: [],
      logicFunctions: [],
      frontComponents: [],
      roles: [
        {
          universalIdentifier: 'f9d06652-db4d-51d0-84ff-b4e233934ed4',
          label: 'Ambassador Manager',
          rowLevelPermissionPredicateGroups: [
            {
              universalIdentifier: 'cb8407cb-35c3-5336-becf-58995b35582b',
              objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.OR,
            },
          ],
          rowLevelPermissionPredicates: [
            {
              universalIdentifier: '1d2fe188-5d9a-5a5e-b44f-b95e26bce132',
              objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
              fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
              operand: RowLevelPermissionPredicateOperand.IS,
              value: {
                isCurrentWorkspaceMemberSelected: true,
                selectedRecordIds: [],
              },
              rowLevelPermissionPredicateGroupUniversalIdentifier:
                'cb8407cb-35c3-5336-becf-58995b35582b',
            },
          ],
        },
      ],
      skills: [],
      agents: [],
      publicAssets: [],
      views: [],
      navigationMenuItems: [],
      pageLayouts: [],
      pageLayoutTabs: [],
    };

    const ownerFlatApplication = {
      universalIdentifier: manifest.application.universalIdentifier,
    } as FlatApplication;

    const result = computeApplicationManifestAllUniversalFlatEntityMaps({
      manifest,
      ownerFlatApplication,
      now: '2026-05-11T00:00:00.000Z',
    });

    expect(
      result.flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier[
        'cb8407cb-35c3-5336-becf-58995b35582b'
      ],
    ).toMatchObject({
      roleUniversalIdentifier: 'f9d06652-db4d-51d0-84ff-b4e233934ed4',
      objectMetadataUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
    });

    expect(
      result.flatRowLevelPermissionPredicateMaps.byUniversalIdentifier[
        '1d2fe188-5d9a-5a5e-b44f-b95e26bce132'
      ],
    ).toMatchObject({
      roleUniversalIdentifier: 'f9d06652-db4d-51d0-84ff-b4e233934ed4',
      objectMetadataUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
      fieldMetadataUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
      rowLevelPermissionPredicateGroupUniversalIdentifier:
        'cb8407cb-35c3-5336-becf-58995b35582b',
      operand: RowLevelPermissionPredicateOperand.IS,
    });
  });
});
