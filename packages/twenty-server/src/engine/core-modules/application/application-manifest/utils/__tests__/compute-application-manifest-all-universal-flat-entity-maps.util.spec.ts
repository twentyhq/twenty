import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeApplicationManifestAllUniversalFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/compute-application-manifest-all-universal-flat-entity-maps.util';

describe('computeApplicationManifestAllUniversalFlatEntityMaps', () => {
  it('should compute TS_VECTOR universalSettings for top-level field manifests', () => {
    const manifest: Manifest = {
      application: {
        universalIdentifier: 'app-universal-identifier',
        defaultRoleUniversalIdentifier: 'role-universal-identifier',
        displayName: 'Test app',
        description: 'Test app description',
        packageJsonChecksum: null,
        yarnLockChecksum: null,
      },
      objects: [
        {
          universalIdentifier: 'object-universal-identifier',
          nameSingular: 'company',
          namePlural: 'companies',
          labelSingular: 'Company',
          labelPlural: 'Companies',
          labelIdentifierFieldMetadataUniversalIdentifier:
            'label-field-universal-identifier',
          fields: [
            {
              universalIdentifier: 'label-field-universal-identifier',
              objectUniversalIdentifier: 'object-universal-identifier',
              name: 'name',
              label: 'Name',
              type: FieldMetadataType.TEXT,
            },
          ],
        },
      ],
      fields: [
        {
          universalIdentifier: 'search-vector-field-universal-identifier',
          objectUniversalIdentifier: 'object-universal-identifier',
          name: 'searchVector',
          label: 'Search Vector',
          type: FieldMetadataType.TS_VECTOR,
        },
      ],
      logicFunctions: [],
      frontComponents: [],
      permissionFlags: [],
      roles: [],
      skills: [],
      agents: [],
      publicAssets: [],
      views: [],
      navigationMenuItems: [],
      pageLayouts: [],
      pageLayoutTabs: [],
      commandMenuItems: [],
    };

    const allUniversalFlatEntityMaps =
      computeApplicationManifestAllUniversalFlatEntityMaps({
        manifest,
        ownerFlatApplication: {
          universalIdentifier: 'app-universal-identifier',
        } as FlatApplication,
        now: '2026-07-08T00:00:00.000Z',
      });

    const searchVectorFieldMetadata =
      allUniversalFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        'search-vector-field-universal-identifier'
      ];

    expect(searchVectorFieldMetadata).toBeDefined();
    expect(searchVectorFieldMetadata?.universalSettings).toStrictEqual({
      generatedType: 'STORED',
      asExpression: expect.stringContaining('"name"'),
    });
  });
});
