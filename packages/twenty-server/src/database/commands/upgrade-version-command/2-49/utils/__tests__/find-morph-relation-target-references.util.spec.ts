import { FieldMetadataType } from 'twenty-shared/types';

import { findMorphRelationTargetReferences } from 'src/database/commands/upgrade-version-command/2-49/utils/find-morph-relation-target-references.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

const toMaps = <TEntity extends { universalIdentifier: string }>(
  entities: TEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

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
    isActive: true,
    isSystem: false,
  }) as FlatFieldMetadata;

const head = morphField({
  id: 'head',
  universalIdentifier: 'morph',
  morphId: 'morph',
});
// Same score as target-b: the lower id is the representative the 2.48 copy used
const representativeTarget = morphField({
  id: 'target-a',
  universalIdentifier: 'target-a-uid',
  morphId: 'morph',
});
const otherTarget = morphField({
  id: 'target-b',
  universalIdentifier: 'target-b-uid',
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

const universalIdentifiersOf = (entities: { universalIdentifier: string }[]) =>
  entities.map(({ universalIdentifier }) => universalIdentifier);

describe('findMorphRelationTargetReferences', () => {
  const references = findMorphRelationTargetReferences({
    flatFieldMetadataMaps: toMaps([
      head,
      representativeTarget,
      otherTarget,
      headlessTarget,
      textField,
    ]),
    flatViewFieldMaps: toMaps([
      viewField('vf-head', 'head'),
      viewField('vf-target-a', 'target-a'),
      viewField('vf-target-b', 'target-b'),
      viewField('vf-headless', 'headless-target'),
      viewField('vf-text', 'text'),
    ]),
    flatViewFilterMaps: toMaps([
      viewFilter('vfi-head', 'head'),
      viewFilter('vfi-target-a', 'target-a'),
      viewFilter('vfi-relation-target-b', 'text', 'target-b'),
      viewFilter('vfi-headless', 'headless-target'),
    ]),
    flatFieldPermissionMaps: toMaps([
      fieldPermission('fp-head', 'head'),
      fieldPermission('fp-target-a', 'target-a'),
      fieldPermission('fp-target-b', 'target-b'),
      fieldPermission('fp-headless', 'headless-target'),
    ]),
  });

  it('selects the view fields and filters of every target that has a head', () => {
    expect(universalIdentifiersOf(references.viewFields)).toEqual([
      'vf-target-a',
      'vf-target-b',
    ]);
    expect(universalIdentifiersOf(references.viewFilters)).toEqual([
      'vfi-target-a',
      'vfi-relation-target-b',
    ]);
  });

  it('selects the field permissions of the representative target only', () => {
    expect(universalIdentifiersOf(references.fieldPermissions)).toEqual([
      'fp-target-a',
    ]);
  });
});
