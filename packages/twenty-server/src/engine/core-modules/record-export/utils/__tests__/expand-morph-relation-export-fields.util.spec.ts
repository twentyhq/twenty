import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  buildRecordExportColumns,
  formatRecordExportHeader,
  formatRecordExportRow,
} from 'twenty-shared/utils';

import { expandMorphRelationExportFields } from 'src/engine/core-modules/record-export/utils/expand-morph-relation-export-fields.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('expandMorphRelationExportFields', () => {
  const person = getFlatObjectMetadataMock({
    id: 'person-object',
    universalIdentifier: 'person-object',
    labelSingular: 'Personne',
  });
  const company = getFlatObjectMetadataMock({
    id: 'company-object',
    universalIdentifier: 'company-object',
    labelSingular: 'Entreprise',
  });
  const head = getFlatFieldMetadataMock({
    id: 'target-head',
    universalIdentifier: 'target-head',
    objectMetadataId: 'note-target-object',
    name: 'target',
    label: 'Cible',
    type: FieldMetadataType.MORPH_RELATION,
    morphId: 'target-head',
    settings: { relationType: RelationType.MANY_TO_ONE },
  });
  const personTarget = getFlatFieldMetadataMock({
    id: 'person-target',
    universalIdentifier: 'person-target',
    objectMetadataId: head.objectMetadataId,
    name: 'targetPerson',
    type: FieldMetadataType.MORPH_RELATION,
    morphId: head.morphId,
    relationTargetObjectMetadataId: person.id,
    settings: { relationType: RelationType.MANY_TO_ONE },
  });
  const companyTarget = getFlatFieldMetadataMock({
    id: 'company-target',
    universalIdentifier: 'company-target',
    objectMetadataId: head.objectMetadataId,
    name: 'targetCompany',
    type: FieldMetadataType.MORPH_RELATION,
    morphId: head.morphId,
    relationTargetObjectMetadataId: company.id,
    settings: { relationType: RelationType.MANY_TO_ONE },
    isActive: false,
  });
  const fields = [head, personTarget, companyTarget];
  const flatFieldMetadataMaps = fields.reduce<
    FlatEntityMaps<FlatFieldMetadata>
  >(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );
  const flatObjectMetadataMaps = [person, company].reduce<
    FlatEntityMaps<FlatObjectMetadata>
  >(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

  it.each([false, true])(
    'preserves translated target labels and deduplicates targets, includeInactive=%s',
    (shouldIncludeInactiveFields) => {
      const columns = buildRecordExportColumns(
        expandMorphRelationExportFields({
          fields,
          flatObjectMetadata: { fieldIds: fields.map((field) => field.id) },
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
          shouldIncludeInactiveFields,
        }),
      );

      expect(formatRecordExportHeader(columns)).toBe(
        shouldIncludeInactiveFields
          ? '\uFEFFId,Cible / Personne Id,Cible / Entreprise Id\n'
          : '\uFEFFId,Cible / Personne Id\n',
      );
      expect(
        formatRecordExportRow({
          columns,
          record: {
            id: '1',
            targetPersonId: 'person-1',
            targetCompanyId: null,
          },
        }),
      ).toBe(shouldIncludeInactiveFields ? '1,person-1,\n' : '1,person-1\n');
    },
  );

  it('rejects missing target object metadata', () => {
    expect(() =>
      expandMorphRelationExportFields({
        fields: [head],
        flatObjectMetadata: { fieldIds: fields.map((field) => field.id) },
        flatFieldMetadataMaps,
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      }),
    ).toThrow('An export field is no longer available.');
  });
});
