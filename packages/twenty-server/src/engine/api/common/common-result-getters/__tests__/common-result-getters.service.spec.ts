import {
  FieldMetadataType,
  FileFolder,
  type ObjectRecord,
  RelationType,
} from 'twenty-shared/types';

import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const createField = ({
  id,
  objectMetadataId,
  ...overrides
}: Pick<FlatFieldMetadata, 'id' | 'name' | 'objectMetadataId' | 'type'> &
  Partial<FlatFieldMetadata>): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    objectMetadataId,
    objectMetadataUniversalIdentifier: `${objectMetadataId}-universal-identifier`,
    ...overrides,
  });

const createObject = ({
  id,
  ...overrides
}: Pick<FlatObjectMetadata, 'id' | 'fieldIds' | 'nameSingular'> &
  Partial<FlatObjectMetadata>): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    namePlural: `${overrides.nameSingular}s`,
    ...overrides,
  });

const buildFlatFieldMetadataMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> =>
  fields.reduce(
    (maps, field) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: field,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
  );

const buildFlatObjectMetadataMaps = (
  objects: FlatObjectMetadata[],
): FlatEntityMaps<FlatObjectMetadata> =>
  objects.reduce(
    (maps, object) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: object,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>,
  );

describe('CommonResultGettersService', () => {
  const signFileByIdUrl = jest.fn(
    async ({ fileId }: { fileId: string }) => `signed-${fileId}`,
  );
  const fileUrlService = {
    signFileByIdUrl,
  } as unknown as FileUrlService;

  let service: CommonResultGettersService;

  beforeEach(() => {
    service = new CommonResultGettersService(fileUrlService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('processes field handlers and preserves fields without metadata', async () => {
    const objectMetadataId = 'document-object-id';
    const idField = createField({
      id: 'document-id-field-id',
      name: 'id',
      objectMetadataId,
      type: FieldMetadataType.UUID,
    });
    const filesField = createField({
      id: 'document-files-field-id',
      name: 'files',
      objectMetadataId,
      type: FieldMetadataType.FILES,
    });
    const objectMetadata = createObject({
      id: objectMetadataId,
      nameSingular: 'document',
      fieldIds: [idField.id, filesField.id],
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      idField,
      filesField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      objectMetadata,
    ]);
    const record: ObjectRecord = {
      id: 'document-id',
      files: [
        {
          fileId: 'file-id',
          label: 'document',
          extension: 'pdf',
        },
      ],
      ownerId: 'owner-id',
    };

    const result = await service.processRecord(
      record,
      objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      'workspace-id',
    );

    expect(result).toEqual({
      id: 'document-id',
      files: [
        {
          fileId: 'file-id',
          label: 'document',
          extension: 'pdf',
          url: 'signed-file-id',
        },
      ],
      ownerId: 'owner-id',
    });
    expect(signFileByIdUrl).toHaveBeenCalledWith({
      fileId: 'file-id',
      workspaceId: 'workspace-id',
      fileFolder: FileFolder.FilesField,
    });
  });

  it('reuses field metadata across nested records of the same object type', async () => {
    const companyObjectId = 'company-object-id';
    const personObjectId = 'person-object-id';
    const companyIdField = createField({
      id: 'company-id-field-id',
      name: 'id',
      objectMetadataId: companyObjectId,
      type: FieldMetadataType.UUID,
    });
    const peopleField = createField({
      id: 'company-people-field-id',
      name: 'people',
      objectMetadataId: companyObjectId,
      type: FieldMetadataType.RELATION,
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        joinColumnName: 'companyId',
      },
      relationTargetObjectMetadataId: personObjectId,
    });
    const personIdField = createField({
      id: 'person-id-field-id',
      name: 'id',
      objectMetadataId: personObjectId,
      type: FieldMetadataType.UUID,
    });
    const personNameField = createField({
      id: 'person-name-field-id',
      name: 'name',
      objectMetadataId: personObjectId,
      type: FieldMetadataType.TEXT,
    });
    const companyObject = createObject({
      id: companyObjectId,
      nameSingular: 'company',
      fieldIds: [companyIdField.id, peopleField.id],
    });
    const personObject = createObject({
      id: personObjectId,
      nameSingular: 'person',
      fieldIds: [personIdField.id, personNameField.id],
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      companyIdField,
      peopleField,
      personIdField,
      personNameField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      companyObject,
      personObject,
    ]);
    const records: ObjectRecord[] = [
      {
        id: 'company-1',
        people: [
          { id: 'person-1', name: 'Ada', companyId: 'company-1' },
          { id: 'person-2', name: 'Grace', companyId: 'company-1' },
        ],
      },
      {
        id: 'company-2',
        people: [{ id: 'person-3', name: 'Lin', companyId: 'company-2' }],
      },
    ];
    const fieldMetadataLookupSpies = [
      companyIdField,
      peopleField,
      personIdField,
      personNameField,
    ].map((field) => {
      const universalIdentifier =
        flatFieldMetadataMaps.universalIdentifierById[field.id];
      const lookupSpy = jest.fn(() => universalIdentifier);

      Object.defineProperty(
        flatFieldMetadataMaps.universalIdentifierById,
        field.id,
        {
          configurable: true,
          enumerable: true,
          get: lookupSpy,
        },
      );

      return lookupSpy;
    });
    const missingFieldMetadataLookupSpy = jest.fn(() => undefined);

    Object.defineProperty(
      flatFieldMetadataMaps.universalIdentifierById,
      'undefined',
      {
        configurable: true,
        enumerable: true,
        get: missingFieldMetadataLookupSpy,
      },
    );

    const result = await service.processRecordArray(
      records,
      companyObject,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      'workspace-id',
    );

    expect(result).toEqual(records);
    fieldMetadataLookupSpies.forEach((lookupSpy) =>
      expect(lookupSpy).toHaveBeenCalledTimes(1),
    );
    expect(missingFieldMetadataLookupSpy).not.toHaveBeenCalled();
  });
});
