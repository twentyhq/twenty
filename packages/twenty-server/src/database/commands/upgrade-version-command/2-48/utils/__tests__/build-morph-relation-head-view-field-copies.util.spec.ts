import { FieldMetadataType } from 'twenty-shared/types';

import { buildMorphRelationHeadViewFieldCopies } from 'src/database/commands/upgrade-version-command/2-48/utils/build-morph-relation-head-view-field-copies.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'workspace-custom-application-universal-identifier';

const head = getFlatFieldMetadataMock({
  id: 'head-id',
  universalIdentifier: 'head-universal-identifier',
  objectMetadataId: 'object-id',
  type: FieldMetadataType.MORPH_RELATION,
});

const representativeViewField: FlatViewField = {
  id: 'representative-view-field-id',
  universalIdentifier: 'representative-view-field-universal-identifier',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  fieldMetadataId: 'representative-id',
  fieldMetadataUniversalIdentifier: 'representative-universal-identifier',
  viewId: 'view-id',
  viewUniversalIdentifier: 'view-universal-identifier',
  viewFieldGroupId: null,
  viewFieldGroupUniversalIdentifier: null,
  isVisible: true,
  size: 150,
  position: 1,
  aggregateOperation: null,
  relationTargetFieldMetadataId: null,
  relationTargetFieldMetadataUniversalIdentifier: null,
  isActive: true,
  isSystemSideEffect: false,
  isCanonical: false,
  overrides: null,
  universalOverrides: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('buildMorphRelationHeadViewFieldCopies', () => {
  it('copies the representative view field onto the head as a canonical view field', () => {
    const flatViewFieldMaps: FlatEntityMaps<FlatViewField> =
      createEmptyFlatEntityMaps();

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: representativeViewField,
      flatEntityMapsToMutate: flatViewFieldMaps,
    });

    const copies = buildMorphRelationHeadViewFieldCopies({
      headByRepresentativeId: new Map([['representative-id', head]]),
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatViewFieldMaps,
      flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
    });

    expect(copies).toEqual([
      {
        ...representativeViewField,
        id: expect.any(String),
        universalIdentifier: expect.any(String),
        fieldMetadataId: head.id,
        fieldMetadataUniversalIdentifier: head.universalIdentifier,
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        isCanonical: true,
      },
    ]);
  });
});
