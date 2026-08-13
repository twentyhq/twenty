import { FieldMetadataType } from 'twenty-shared/types';

import { type FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { PrepareUploadedFileTool } from 'src/engine/core-modules/tool/tools/file-tool/prepare-uploaded-file-tool';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

describe('PrepareUploadedFileTool', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const uploadedFileId = '20202020-0000-4000-8000-000000000002';
  const preparedFileId = '20202020-0000-4000-8000-000000000003';

  let filesFieldService: jest.Mocked<FilesFieldService>;
  let flatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;

  const validInput = {
    fileId: uploadedFileId,
    label: 'contract.pdf',
    objectNameSingular: 'attachment',
    fieldName: 'file',
  };

  const buildTool = () =>
    new PrepareUploadedFileTool(filesFieldService, flatEntityMapsCacheService);

  const buildFlatMaps = ({
    fieldType = FieldMetadataType.FILES,
    isActive = true,
  }: { fieldType?: FieldMetadataType; isActive?: boolean } = {}) => ({
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        'attachment-universal-id': {
          id: 'attachment-id',
          nameSingular: 'attachment',
          isActive,
          fieldIds: ['file-field-id', 'name-field-id'],
        },
      },
      universalIdentifierById: { 'attachment-id': 'attachment-universal-id' },
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {
        'file-field-universal-id': {
          id: 'file-field-id',
          name: 'file',
          type: fieldType,
          objectMetadataId: 'attachment-id',
        },
        'name-field-universal-id': {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
          objectMetadataId: 'attachment-id',
        },
      },
      universalIdentifierById: {
        'file-field-id': 'file-field-universal-id',
        'name-field-id': 'name-field-universal-id',
      },
      universalIdentifiersByApplicationId: {},
    },
  });

  beforeEach(() => {
    filesFieldService = {
      copyFileIntoFilesField: jest
        .fn()
        .mockResolvedValue({ id: preparedFileId }),
    } as unknown as jest.Mocked<FilesFieldService>;

    flatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest
        .fn()
        .mockResolvedValue(buildFlatMaps()),
    } as unknown as jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should copy the file into the target field and return the field value', async () => {
    const result = await buildTool().execute(validInput, { workspaceId });

    expect(filesFieldService.copyFileIntoFilesField).toHaveBeenCalledWith({
      fileId: uploadedFileId,
      workspaceId,
      fieldMetadataId: 'file-field-id',
    });
    expect(result.success).toBe(true);
    expect(result.result).toEqual({
      fieldValue: [{ fileId: preparedFileId, label: 'contract.pdf' }],
    });
  });

  it('should fail with a structured error on malformed input', async () => {
    const result = await buildTool().execute(
      { fileId: uploadedFileId },
      { workspaceId },
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid prepare_uploaded_file input');
    expect(filesFieldService.copyFileIntoFilesField).not.toHaveBeenCalled();
  });

  it('should fail when the object does not exist', async () => {
    const result = await buildTool().execute(
      { ...validInput, objectNameSingular: 'unknownObject' },
      { workspaceId },
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('Object "unknownObject" not found');
    expect(filesFieldService.copyFileIntoFilesField).not.toHaveBeenCalled();
  });

  it('should fail when the object is inactive', async () => {
    flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      buildFlatMaps({ isActive: false }),
    );

    const result = await buildTool().execute(validInput, { workspaceId });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Object "attachment" not found');
  });

  it('should fail when the field does not exist on the object', async () => {
    const result = await buildTool().execute(
      { ...validInput, fieldName: 'unknownField' },
      { workspaceId },
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Field "unknownField" not found on object "attachment"',
    );
    expect(filesFieldService.copyFileIntoFilesField).not.toHaveBeenCalled();
  });

  it('should fail and list the files fields when the target field is not a files field', async () => {
    const result = await buildTool().execute(
      { ...validInput, fieldName: 'name' },
      { workspaceId },
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('is not a files field');
    expect(filesFieldService.copyFileIntoFilesField).not.toHaveBeenCalled();
  });

  it('should report a failed copy instead of throwing', async () => {
    filesFieldService.copyFileIntoFilesField.mockRejectedValue(
      new Error('File not found'),
    );

    const result = await buildTool().execute(validInput, { workspaceId });

    expect(result.success).toBe(false);
    expect(result.error).toBe('File not found');
  });
});
