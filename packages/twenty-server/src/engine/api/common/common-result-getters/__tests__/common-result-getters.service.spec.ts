import {
  FieldMetadataType,
  FileFolder,
  type ObjectRecord,
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
  const service = new CommonResultGettersService({
    signFileByIdUrl,
  } as unknown as FileUrlService);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('runs a field handler once when multiple record fields share its type', async () => {
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
    };

    await service.processRecord(
      record,
      objectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      'workspace-id',
    );

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
});
