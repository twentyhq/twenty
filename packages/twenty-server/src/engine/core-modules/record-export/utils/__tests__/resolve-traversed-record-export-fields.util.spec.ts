import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { resolveTraversedRecordExportFields } from 'src/engine/core-modules/record-export/utils/resolve-traversed-record-export-fields.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const OPPORTUNITY_ID = 'opportunity';
const COMPANY_ID = 'company';
const PERSON_ID = 'person';

const buildField = (
  overrides: Parameters<typeof getFlatFieldMetadataMock>[0] &
    Pick<FlatFieldMetadata, 'id'>,
): FlatFieldMetadata => getFlatFieldMetadataMock(overrides);

const companyRelation = buildField({
  id: 'company-relation',
  universalIdentifier: 'company-relation',
  objectMetadataId: OPPORTUNITY_ID,
  type: FieldMetadataType.RELATION,
  name: 'company',
  label: 'Company',
  settings: { relationType: RelationType.MANY_TO_ONE },
  relationTargetObjectMetadataId: COMPANY_ID,
});
const peopleRelation = buildField({
  id: 'people-relation',
  universalIdentifier: 'people-relation',
  objectMetadataId: COMPANY_ID,
  type: FieldMetadataType.RELATION,
  name: 'people',
  label: 'People',
  settings: { relationType: RelationType.ONE_TO_MANY },
  relationTargetObjectMetadataId: PERSON_ID,
});
const companyEmployees = buildField({
  id: 'company-employees',
  universalIdentifier: 'company-employees',
  objectMetadataId: COMPANY_ID,
  type: FieldMetadataType.NUMBER,
  name: 'employees',
  label: 'Employees',
});
const companyOwner = buildField({
  id: 'company-owner',
  universalIdentifier: 'company-owner',
  objectMetadataId: COMPANY_ID,
  type: FieldMetadataType.RELATION,
  name: 'accountOwner',
  label: 'Account Owner',
  settings: { relationType: RelationType.MANY_TO_ONE },
  relationTargetObjectMetadataId: 'workspaceMember',
});
const personCity = buildField({
  id: 'person-city',
  universalIdentifier: 'person-city',
  objectMetadataId: PERSON_ID,
  type: FieldMetadataType.TEXT,
  name: 'city',
  label: 'City',
});
const inactiveCompanyName = buildField({
  id: 'company-inactive',
  universalIdentifier: 'company-inactive',
  objectMetadataId: COMPANY_ID,
  type: FieldMetadataType.TEXT,
  name: 'legacyName',
  label: 'Legacy Name',
  isActive: false,
});
const companyRelationWithJunction = buildField({
  id: 'company-junction-relation',
  universalIdentifier: 'company-junction-relation',
  objectMetadataId: OPPORTUNITY_ID,
  type: FieldMetadataType.RELATION,
  name: 'companyViaJunction',
  label: 'Company via junction',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    junctionTargetFieldId: 'junction-target',
  },
  relationTargetObjectMetadataId: COMPANY_ID,
});

const allFields = [
  companyRelation,
  peopleRelation,
  companyEmployees,
  companyOwner,
  personCity,
  inactiveCompanyName,
  companyRelationWithJunction,
];
const flatFieldMetadataMaps = allFields.reduce<FlatFieldMetadataMaps>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

const resolve = (
  fieldMetadataId: string,
  relationTargetFieldMetadataId: string,
) =>
  resolveTraversedRecordExportFields({
    traversedFields: [{ fieldMetadataId, relationTargetFieldMetadataId }],
    objectMetadataId: OPPORTUNITY_ID,
    flatFieldMetadataMaps,
  });

describe('resolveTraversedRecordExportFields', () => {
  it('returns the relation and target fields of a many-to-one traversal', () => {
    expect(resolve(companyRelation.id, companyEmployees.id)).toEqual([
      { relationField: companyRelation, targetField: companyEmployees },
    ]);
  });

  it('returns nothing when no field is traversed', () => {
    expect(
      resolveTraversedRecordExportFields({
        traversedFields: [],
        objectMetadataId: OPPORTUNITY_ID,
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });

  it.each([
    [
      'the relation belongs to another object or is one-to-many',
      peopleRelation.id,
      personCity.id,
    ],
    [
      'the relation goes through a junction object',
      companyRelationWithJunction.id,
      companyEmployees.id,
    ],
    ['the target belongs to another object', companyRelation.id, personCity.id],
    ['the target is a relation', companyRelation.id, companyOwner.id],
    ['the target is inactive', companyRelation.id, inactiveCompanyName.id],
    ['the relation is not a relation', companyEmployees.id, personCity.id],
  ])('rejects the traversal when %s', (_, fieldMetadataId, targetId) => {
    expect(() => resolve(fieldMetadataId, targetId)).toThrow(
      new BadRequestException('An export field is no longer available.'),
    );
  });
});
