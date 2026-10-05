import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeMaxFieldCountPerRecord } from 'src/engine/api/common/common-query-runners/utils/compute-max-field-count-per-record.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildFlatEntityMaps = <
  TFlatEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<TFlatEntity>,
  );

const peopleField = getFlatFieldMetadataMock({
  universalIdentifier: 'company-people',
  objectMetadataId: 'company',
  type: FieldMetadataType.RELATION,
  name: 'people',
  settings: { relationType: RelationType.ONE_TO_MANY },
  relationTargetObjectMetadataId: 'person',
});

const companyField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-company',
  objectMetadataId: 'person',
  type: FieldMetadataType.RELATION,
  name: 'company',
  settings: { relationType: RelationType.MANY_TO_ONE },
  relationTargetObjectMetadataId: 'company',
});

const company = getFlatObjectMetadataMock({
  id: 'company',
  universalIdentifier: 'company',
  fieldIds: [peopleField.id],
});

const person = getFlatObjectMetadataMock({
  id: 'person',
  universalIdentifier: 'person',
  fieldIds: [companyField.id],
});

const flatObjectMetadataMaps = buildFlatEntityMaps([company, person]);
const flatFieldMetadataMaps = buildFlatEntityMaps([peopleField, companyField]);

const computeFor = (
  flatObjectMetadata: FlatObjectMetadata,
  select: CommonSelectedFields,
  recordLimitPerOneToManyRelation = 60,
) =>
  computeMaxFieldCountPerRecord({
    select,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    recordLimitPerOneToManyRelation,
  });

describe('computeMaxFieldCountPerRecord', () => {
  it('should count each selected field of the record', () => {
    expect(computeFor(company, { id: true, name: true })).toBe(2);
  });

  it('should count a record with no selected field as one field', () => {
    expect(computeFor(company, {})).toBe(1);
  });

  it('should add the fields of a to-one relation once', () => {
    expect(
      computeFor(person, { id: true, company: { id: true, name: true } }),
    ).toBe(3);
  });

  it('should multiply the fields of a one-to-many relation by its limit', () => {
    expect(computeFor(company, { id: true, people: { id: true } })).toBe(61);
  });

  it('should multiply fields nested under a one-to-many relation by its limit', () => {
    expect(
      computeFor(company, {
        id: true,
        people: { id: true, company: { id: true, name: true } },
      }),
    ).toBe(181);
  });

  it('should use the given one-to-many limit', () => {
    expect(computeFor(company, { id: true, people: { id: true } }, 5)).toBe(6);
  });
});
