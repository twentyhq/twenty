import { FieldMetadataType } from 'twenty-shared/types';

import { findMorphRelationTargetReferences } from 'src/database/commands/upgrade-version-command/2-49/utils/find-morph-relation-target-references.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

const toMaps = <
  TEntity extends
    | FlatFieldMetadata
    | FlatViewField
    | FlatViewFilter
    | FlatFieldPermission,
>(
  entities: TEntity[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.universalIdentifier, entity]),
    ),
  }) as unknown as FlatEntityMaps<TEntity>;

const morphField = ({
  id,
  universalIdentifier,
  morphId,
}: {
  id: string;
  universalIdentifier: string;
  morphId: string;
}) =>
  ({
    id,
    universalIdentifier,
    morphId,
    type: FieldMetadataType.MORPH_RELATION,
  }) as FlatFieldMetadata;

const head = morphField({
  id: 'head',
  universalIdentifier: 'morph',
  morphId: 'morph',
});
const target = morphField({
  id: 'target',
  universalIdentifier: 'target-uid',
  morphId: 'morph',
});
const headlessTarget = morphField({
  id: 'headless-target',
  universalIdentifier: 'headless-target-uid',
  morphId: 'headless-morph',
});
const textField = {
  id: 'text',
  universalIdentifier: 'text-uid',
  type: FieldMetadataType.TEXT,
} as FlatFieldMetadata;

const viewField = (universalIdentifier: string, fieldMetadataId: string) =>
  ({ universalIdentifier, fieldMetadataId }) as FlatViewField;
const viewFilter = (
  universalIdentifier: string,
  fieldMetadataId: string,
  relationTargetFieldMetadataId: string | null = null,
) =>
  ({
    universalIdentifier,
    fieldMetadataId,
    relationTargetFieldMetadataId,
  }) as FlatViewFilter;
const fieldPermission = (
  universalIdentifier: string,
  fieldMetadataId: string,
) => ({ universalIdentifier, fieldMetadataId }) as FlatFieldPermission;

describe('findMorphRelationTargetReferences', () => {
  it('returns the references pointing at a target whose morph relation has a head', () => {
    const references = findMorphRelationTargetReferences({
      flatFieldMetadataMaps: toMaps([head, target, headlessTarget, textField]),
      flatViewFieldMaps: toMaps([
        viewField('vf-head', 'head'),
        viewField('vf-target', 'target'),
        viewField('vf-headless', 'headless-target'),
        viewField('vf-text', 'text'),
      ]),
      flatViewFilterMaps: toMaps([
        viewFilter('vfi-head', 'head'),
        viewFilter('vfi-target', 'target'),
        viewFilter('vfi-relation-target', 'text', 'target'),
        viewFilter('vfi-headless', 'headless-target'),
      ]),
      flatFieldPermissionMaps: toMaps([
        fieldPermission('fp-head', 'head'),
        fieldPermission('fp-target', 'target'),
        fieldPermission('fp-headless', 'headless-target'),
      ]),
    });

    expect(
      references.viewFields.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['vf-target']);
    expect(
      references.viewFilters.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual(['vfi-target', 'vfi-relation-target']);
    expect(
      references.fieldPermissions.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual(['fp-target']);
  });
});
