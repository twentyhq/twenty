import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { PrepareUploadedFileInputZodSchema } from 'src/engine/core-modules/tool/tools/file-tool/prepare-uploaded-file-tool.schema';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class PrepareUploadedFileTool implements Tool {
  private readonly logger = new Logger(PrepareUploadedFileTool.name);

  description =
    'Prepare a file the user uploaded in this conversation so it can be stored on a record. Returns a fileId to set on the target files field, for instance to attach a document to a person by creating an attachment record. Call this before create_record or update_record: the fileId returned by this tool must be used instead of the uploaded fileId, which a record cannot reference directly.';
  inputSchema = PrepareUploadedFileInputZodSchema;

  constructor(
    private readonly filesFieldService: FilesFieldService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const parseResult = PrepareUploadedFileInputZodSchema.safeParse(parameters);

    if (!parseResult.success) {
      return {
        success: false,
        message: 'Invalid prepare_uploaded_file input',
        error: parseResult.error.message,
      };
    }

    const { fileId, label, objectNameSingular, fieldName } = parseResult.data;
    const { workspaceId } = context;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find(
      (metadata): metadata is FlatObjectMetadata =>
        isDefined(metadata) &&
        metadata.nameSingular === objectNameSingular &&
        metadata.isActive,
    );

    if (!isDefined(flatObjectMetadata)) {
      return {
        success: false,
        message: `Object "${objectNameSingular}" not found`,
        error: `Object "${objectNameSingular}" not found`,
      };
    }

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    const fieldMetadataId = fieldIdByName[fieldName];

    const flatFieldMetadata = isDefined(fieldMetadataId)
      ? findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (!isDefined(flatFieldMetadata)) {
      return {
        success: false,
        message: `Field "${fieldName}" not found on object "${objectNameSingular}"`,
        error: `Field "${fieldName}" not found on object "${objectNameSingular}"`,
      };
    }

    if (flatFieldMetadata.type !== FieldMetadataType.FILES) {
      const filesFieldNames = Object.entries(fieldIdByName)
        .map(([name, id]) =>
          findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>({
            flatEntityId: id,
            flatEntityMaps: flatFieldMetadataMaps,
          })?.type === FieldMetadataType.FILES
            ? name
            : undefined,
        )
        .filter(isDefined)
        .join(', ');

      return {
        success: false,
        message: `Field "${fieldName}" on object "${objectNameSingular}" is not a files field. Available files fields: ${filesFieldNames || 'none'}`,
        error: `Field "${fieldName}" is not a files field`,
      };
    }

    try {
      const preparedFile = await this.filesFieldService.copyFileIntoFilesField({
        fileId,
        workspaceId,
        fieldMetadataId: flatFieldMetadata.id,
      });

      return {
        success: true,
        message: `File prepared for ${objectNameSingular}.${fieldName}. Set ${fieldName} to the fieldValue below.`,
        result: {
          fieldValue: [{ fileId: preparedFile.id, label }],
        },
      };
    } catch (error) {
      this.logger.error('Failed to prepare uploaded file', { error });

      return {
        success: false,
        message: `Failed to prepare file: ${error.message}`,
        error: error.message,
      };
    }
  }
}
