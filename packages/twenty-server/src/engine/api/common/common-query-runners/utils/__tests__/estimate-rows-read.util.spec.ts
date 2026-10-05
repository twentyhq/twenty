import {
  FieldMetadataType,
  OrderByDirection,
  RelationType,
} from 'twenty-shared/types';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { estimateRowsRead } from 'src/engine/api/common/common-query-runners/utils/estimate-rows-read.util';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
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

const idField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-id',
  objectMetadataId: 'person',
  type: FieldMetadataType.UUID,
  name: 'id',
});

const nameField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-name',
  objectMetadataId: 'person',
  type: FieldMetadataType.FULL_NAME,
  name: 'name',
});

const emailsField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-emails',
  objectMetadataId: 'person',
  type: FieldMetadataType.EMAILS,
  name: 'emails',
});

const positionField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-position',
  objectMetadataId: 'person',
  type: FieldMetadataType.POSITION,
  name: 'position',
});

const companyField = getFlatFieldMetadataMock({
  universalIdentifier: 'person-company',
  objectMetadataId: 'person',
  type: FieldMetadataType.RELATION,
  name: 'company',
  settings: { relationType: RelationType.MANY_TO_ONE },
  relationTargetObjectMetadataId: 'company',
});

const buildSingleFieldIndex = ({
  universalIdentifier,
  fieldMetadataId,
  subFieldName = null,
  isUnique = false,
}: {
  universalIdentifier: string;
  fieldMetadataId: string;
  subFieldName?: string | null;
  isUnique?: boolean;
}): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    id: universalIdentifier,
    universalIdentifier,
    objectMetadataId: 'person',
    objectMetadataUniversalIdentifier: 'person',
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

const primaryEmailUniqueIndex = buildSingleFieldIndex({
  universalIdentifier: 'person-primary-email-unique',
  fieldMetadataId: emailsField.id,
  subFieldName: 'primaryEmail',
  isUnique: true,
});

const companyIndex = buildSingleFieldIndex({
  universalIdentifier: 'person-company',
  fieldMetadataId: companyField.id,
});

const company = getFlatObjectMetadataMock({
  id: 'company',
  universalIdentifier: 'company',
  nameSingular: 'company',
});

const person = getFlatObjectMetadataMock({
  id: 'person',
  universalIdentifier: 'person',
  nameSingular: 'person',
  fieldIds: [
    idField.id,
    nameField.id,
    emailsField.id,
    positionField.id,
    companyField.id,
  ],
  indexMetadataIds: [primaryEmailUniqueIndex.id, companyIndex.id],
});

const idLeaf: OrderByLeaf = {
  kind: 'scalar',
  path: ['id'],
  direction: OrderByDirection.AscNullsLast,
  fieldMetadata: idField,
};

const positionLeaf: OrderByLeaf = {
  kind: 'scalar',
  path: ['position'],
  direction: OrderByDirection.AscNullsFirst,
  fieldMetadata: positionField,
};

const estimateForPerson = ({
  filter = {},
  orderByLeaves,
  limit,
}: {
  filter?: Partial<ObjectRecordFilter>;
  orderByLeaves: OrderByLeaf[];
  limit?: number;
}) =>
  estimateRowsRead({
    filter,
    orderByLeaves,
    limit,
    flatObjectMetadata: person,
    flatObjectMetadataMaps: buildFlatEntityMaps([company, person]),
    flatFieldMetadataMaps: buildFlatEntityMaps([
      idField,
      nameField,
      emailsField,
      positionField,
      companyField,
    ]),
    flatIndexMaps: buildFlatEntityMaps([primaryEmailUniqueIndex, companyIndex]),
    approximateRecordCountByTableName: new Map([
      [computeObjectTargetTable(person), 300_000],
      [computeObjectTargetTable(company), 20_000],
    ]),
  });

describe('estimateRowsRead', () => {
  it('should read one row for an equality on a unique index', () => {
    expect(
      estimateForPerson({
        filter: { emails: { primaryEmail: { eq: 'p4242@example.com' } } },
        orderByLeaves: [idLeaf],
        limit: 61,
      }),
    ).toBe(1);
  });

  it('should read the children of one parent for an equality on a join column', () => {
    expect(
      estimateForPerson({
        filter: { companyId: { eq: 'company-id' } },
        orderByLeaves: [positionLeaf, idLeaf],
        limit: 61,
      }),
    ).toBe(15);
  });

  it('should stop at the limit when an index serves the sort', () => {
    expect(estimateForPerson({ orderByLeaves: [idLeaf], limit: 61 })).toBe(61);
  });

  it('should read the whole table for a contains filter', () => {
    expect(
      estimateForPerson({
        filter: { name: { firstName: { ilike: '%jo%' } } },
        orderByLeaves: [positionLeaf, idLeaf],
        limit: 61,
      }),
    ).toBe(300_000);
  });

  it('should read the whole table when no index serves the sort', () => {
    expect(
      estimateForPerson({ orderByLeaves: [positionLeaf, idLeaf], limit: 61 }),
    ).toBe(300_000);
  });

  it('should read every matching row without a limit', () => {
    expect(estimateForPerson({ orderByLeaves: [] })).toBe(300_000);
  });

  it('should add up OR branches that each use an index', () => {
    expect(
      estimateForPerson({
        filter: {
          or: [
            { emails: { primaryEmail: { eq: 'p4242@example.com' } } },
            { companyId: { eq: 'company-id' } },
          ],
        },
        orderByLeaves: [idLeaf],
        limit: 61,
      }),
    ).toBe(16);
  });
});
