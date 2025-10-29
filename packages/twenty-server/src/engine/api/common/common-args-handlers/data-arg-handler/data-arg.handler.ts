import { Injectable } from '@nestjs/common';

import { FieldMetadataType, ObjectRecord } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class DataArgHandler {
  constructor(
    private readonly recordPositionService: RecordPositionService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async overrideDataByFieldMetadata({
    partialRecordInputs,
    authContext,
    objectMetadataItemWithFieldMaps,
    shouldBackfillPositionIfUndefined = true,
  }: {
    partialRecordInputs: Partial<ObjectRecord>[] | undefined;
    authContext: AuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    shouldBackfillPositionIfUndefined?: boolean;
  }): Promise<Partial<ObjectRecord>[]> {
    if (!isDefined(partialRecordInputs)) {
      return [];
    }

    const allOverriddenRecords: Partial<ObjectRecord>[] = [];

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const overriddenPositionRecords =
      await this.recordPositionService.overridePositionOnRecords({
        partialRecordInputs,
        workspaceId: workspace.id,
        objectMetadata: {
          isCustom: objectMetadataItemWithFieldMaps.isCustom,
          nameSingular: objectMetadataItemWithFieldMaps.nameSingular,
          fieldIdByName: objectMetadataItemWithFieldMaps.fieldIdByName,
        },
        shouldBackfillPositionIfUndefined,
      });

    for (const record of overriddenPositionRecords) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createArgByArgKey: [string, any][] = await Promise.all(
        Object.entries(record).map(async ([key, value]) => {
          const fieldMetadataId =
            objectMetadataItemWithFieldMaps.fieldIdByName[key];
          const fieldMetadata =
            objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

          if (!fieldMetadata) {
            return [key, value];
          }

          switch (fieldMetadata.type) {
            case FieldMetadataType.NUMBER:
            case FieldMetadataType.RICH_TEXT:
            case FieldMetadataType.PHONES:
            case FieldMetadataType.RICH_TEXT_V2:
            case FieldMetadataType.LINKS:
            case FieldMetadataType.EMAILS: {
              const transformedRecord =
                await this.recordInputTransformerService.process({
                  recordInput: { [key]: value },
                  objectMetadataMapItem: objectMetadataItemWithFieldMaps,
                });

              return [key, transformedRecord[key]];
            }
            default:
              return [key, value];
          }
        }),
      );

      allOverriddenRecords.push(Object.fromEntries(createArgByArgKey));
    }

    return allOverriddenRecords;
  }
}
