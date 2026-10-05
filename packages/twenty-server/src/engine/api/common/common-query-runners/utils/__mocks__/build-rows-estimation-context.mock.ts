import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { buildRowsEstimationContext } from 'src/engine/api/common/common-query-runners/utils/build-rows-estimation-context.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

const buildFlatEntityMaps = <
  TFlatEntity extends
    | FlatFieldMetadata
    | FlatObjectMetadata
    | FlatIndexMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<TFlatEntity>,
  );

const buildSingleFieldIndex = ({
  universalIdentifier,
  objectMetadataId,
  fieldMetadataId,
  subFieldName = null,
  isUnique = false,
}: {
  universalIdentifier: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  subFieldName?: string | null;
  isUnique?: boolean;
}): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    id: universalIdentifier,
    universalIdentifier,
    objectMetadataId,
    objectMetadataUniversalIdentifier: objectMetadataId,
    applicationUniversalIdentifier: 'application',
    isUnique,
    flatIndexFieldMetadatas: [
      {
        id: `${universalIdentifier}-field`,
        workspaceId: 'workspace',
        indexMetadataId: universalIdentifier,
        fieldMetadataId,
        order: 0,
        subFieldName,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  });

export const personIdField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-id',
  objectMetadataId: 'person',
  type: FieldMetadataType.UUID,
  name: 'id',
});

const personNameField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-name',
  objectMetadataId: 'person',
  type: FieldMetadataType.FULL_NAME,
  name: 'name',
});

const personEmailsField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-emails',
  objectMetadataId: 'person',
  type: FieldMetadataType.EMAILS,
  name: 'emails',
});

export const personPositionField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-position',
  objectMetadataId: 'person',
  type: FieldMetadataType.POSITION,
  name: 'position',
});

const personCompanyField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-company',
  objectMetadataId: 'person',
  type: FieldMetadataType.RELATION,
  name: 'company',
  settings: { relationType: RelationType.MANY_TO_ONE },
  relationTargetObjectMetadataId: 'company',
});

const companyIdField = getFlatFieldMetadataMock({
  universalIdentifier: 'company-id',
  objectMetadataId: 'company',
  type: FieldMetadataType.UUID,
  name: 'id',
});

const companyPeopleField = getFlatFieldMetadataMock({
  universalIdentifier: 'company-people',
  objectMetadataId: 'company',
  type: FieldMetadataType.RELATION,
  name: 'people',
  settings: { relationType: RelationType.ONE_TO_MANY },
  relationTargetObjectMetadataId: 'person',
});

const personPrimaryEmailUniqueIndex = buildSingleFieldIndex({
  universalIdentifier: 'person-primary-email-unique',
  objectMetadataId: 'person',
  fieldMetadataId: personEmailsField.id,
  isUnique: true,
});

const personCompanyIndex = buildSingleFieldIndex({
  universalIdentifier: 'person-company',
  objectMetadataId: 'person',
  fieldMetadataId: personCompanyField.id,
});

export const personPositionIndex = buildSingleFieldIndex({
  universalIdentifier: 'person-position',
  objectMetadataId: 'person',
  fieldMetadataId: personPositionField.id,
});

const company = getFlatObjectMetadataMock({
  id: 'company',
  universalIdentifier: 'company',
  nameSingular: 'company',
  fieldIds: [companyIdField.id, companyPeopleField.id],
});

const buildPerson = ({
  flatIndexMetadatas,
  duplicateCriteria,
}: {
  flatIndexMetadatas: FlatIndexMetadata[];
  duplicateCriteria: string[][];
}) =>
  getFlatObjectMetadataMock({
    id: 'person',
    universalIdentifier: 'person',
    nameSingular: 'person',
    fieldIds: [
      personIdField.id,
      personNameField.id,
      personEmailsField.id,
      personPositionField.id,
      personCompanyField.id,
    ],
    indexMetadataIds: flatIndexMetadatas.map(({ id }) => id),
    duplicateCriteria,
  });

export const buildRowsEstimationContextMock = ({
  objectNameSingular,
  additionalPersonIndexes = [],
  duplicateCriteria = [
    ['nameFirstName', 'nameLastName'],
    ['emailsPrimaryEmail'],
  ],
}: {
  objectNameSingular: 'person' | 'company';
  additionalPersonIndexes?: FlatIndexMetadata[];
  duplicateCriteria?: string[][];
}): RowsEstimationContext => {
  const personIndexes = [
    personPrimaryEmailUniqueIndex,
    personCompanyIndex,
    ...additionalPersonIndexes,
  ];

  const person = buildPerson({
    flatIndexMetadatas: personIndexes,
    duplicateCriteria,
  });

  return buildRowsEstimationContext({
    flatObjectMetadata: objectNameSingular === 'person' ? person : company,
    flatObjectMetadataMaps: buildFlatEntityMaps([company, person]),
    flatFieldMetadataMaps: buildFlatEntityMaps([
      personIdField,
      personNameField,
      personEmailsField,
      personPositionField,
      personCompanyField,
      companyIdField,
      companyPeopleField,
    ]),
    flatIndexMaps: buildFlatEntityMaps(personIndexes),
    approximateRecordCountByTableName: new Map([
      [computeObjectTargetTable(person), 300_000],
      [computeObjectTargetTable(company), 20_000],
    ]),
  });
};
