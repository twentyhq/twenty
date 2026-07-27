import {
  FieldMetadataType,
  FileFolder,
  type ObjectRecord,
} from 'twenty-shared/types';

import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

jest.mock(
  'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util',
  () => {
    const actual = jest.requireActual(
      'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util',
    );

    return {
      ...actual,
      getFlatFieldsFromFlatObjectMetadata: jest.fn(
        actual.getFlatFieldsFromFlatObjectMetadata,
      ),
    };
  },
);

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
    jest.clearAllMocks();
  });

  it('runs a shared field handler once and preserves fields without metadata', async () => {
    const objectMetadataId = 'document-object-id';
    const filesField = createField({
      id: 'document-files-field-id',
      name: 'files',
      objectMetadataId,
      type: FieldMetadataType.FILES,
    });
    const attachmentsField = createField({
      id: 'document-attachments-field-id',
      name: 'attachments',
      objectMetadataId,
      type: FieldMetadataType.FILES,
    });
    const objectMetadata = getFlatObjectMetadataMock({
      id: objectMetadataId,
      universalIdentifier: 'document-object-universal-identifier',
      nameSingular: 'document',
      namePlural: 'documents',
      fieldIds: [filesField.id, attachmentsField.id],
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      filesField,
      attachmentsField,
    ]);
    const flatObjectMetadataMaps =
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>;
    const record: ObjectRecord = {
      id: 'document-id',
      files: [
        {
          fileId: 'file-id',
          label: 'document',
          extension: 'pdf',
        },
      ],
      attachments: [
        {
          fileId: 'attachment-id',
          label: 'attachment',
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
      ...record,
      files: [
        {
          fileId: 'file-id',
          label: 'document',
          extension: 'pdf',
          url: 'signed-file-id',
        },
      ],
      attachments: [
        {
          fileId: 'attachment-id',
          label: 'attachment',
          extension: 'pdf',
          url: 'signed-attachment-id',
        },
      ],
    });
    expect(signFileByIdUrl).toHaveBeenCalledTimes(2);
    expect(signFileByIdUrl).toHaveBeenCalledWith({
      fileId: 'file-id',
      workspaceId: 'workspace-id',
      fileFolder: FileFolder.FilesField,
    });
    expect(signFileByIdUrl).toHaveBeenCalledWith({
      fileId: 'attachment-id',
      workspaceId: 'workspace-id',
      fileFolder: FileFolder.FilesField,
    });
  });

  it('reuses field metadata while its source references stay unchanged', async () => {
    const objectMetadataId = 'document-object-id';
    const idField = createField({
      id: 'document-id-field-id',
      name: 'id',
      objectMetadataId,
      type: FieldMetadataType.UUID,
    });
    const objectMetadata = getFlatObjectMetadataMock({
      id: objectMetadataId,
      universalIdentifier: 'document-object-universal-identifier',
      nameSingular: 'document',
      namePlural: 'documents',
      fieldIds: [idField.id],
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([idField]);
    const flatObjectMetadataMaps =
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>;
    const record: ObjectRecord = {
      id: 'document-id',
    };

    await service.processRecord(
      record,
      objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      'workspace-id',
    );
    await service.processRecord(
      record,
      objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      'workspace-id',
    );

    expect(getFlatFieldsFromFlatObjectMetadata).toHaveBeenCalledTimes(1);

    const refreshedObjectMetadata = { ...objectMetadata };

    await service.processRecord(
      record,
      refreshedObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      'workspace-id',
    );

    expect(getFlatFieldsFromFlatObjectMetadata).toHaveBeenCalledTimes(2);

    await service.processRecord(
      record,
      refreshedObjectMetadata,
      flatObjectMetadataMaps,
      buildFlatFieldMetadataMaps([idField]),
      'workspace-id',
    );

    expect(getFlatFieldsFromFlatObjectMetadata).toHaveBeenCalledTimes(3);
  });
});
