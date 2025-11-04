import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import {
  FieldMetadataType,
  ObjectRecord,
  RelationType,
} from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  assertUnreachable,
  isDefined,
} from 'twenty-shared/utils';

import { FieldMetadataRelationSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { coerceActorFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-actor-field-or-throw.util';
import { coerceAddressFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-address-field-or-throw.util';
import { coerceArrayFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-array-field-or-throw.util';
import { coerceBooleanFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-boolean-field-or-throw.util';
import { coerceCurrencyFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-currency-field-or-throw.util';
import { coerceDateAndDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-date-and-date-time-field-or-throw.util';
import { coerceEmailsFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-emails-field-or-throw.util';
import { coerceFullNameFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-full-name-field-or-throw.util';
import { coerceLinksFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-links-field-or-throw.util';
import { coerceMultiSelectFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-multi-select-field-or-throw.util';
import { coerceNumberFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-number-field-or-throw.util';
import { coerceNumericFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-numeric-field-or-throw.util';
import { coercePhonesFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-phones-field-or-throw.util';
import { coerceRatingAndSelectFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-rating-and-select-field-or-throw.util';
import { coerceRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-raw-json-field-or-throw.util';
import { coerceRichTextV2FieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-rich-text-v2-field-or-throw.util';
import { coerceTextFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-text-field-or-throw.util';
import { coerceUUIDFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-uuid-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class DataArgHandler {
  constructor(private readonly recordPositionService: RecordPositionService) {}

  async coerce({
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

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const coercedRecords: Partial<ObjectRecord>[] = [];

    for (const record of partialRecordInputs) {
      const coercedRecord: Partial<ObjectRecord> = {};

      for (const [key, value] of Object.entries(record)) {
        const fieldMetadataId =
          objectMetadataItemWithFieldMaps.fieldIdByName[key] ||
          objectMetadataItemWithFieldMaps.fieldIdByJoinColumnName[key];

        if (!isDefined(fieldMetadataId)) {
          throw new CommonQueryRunnerException(
            `Object ${objectMetadataItemWithFieldMaps.nameSingular} doesn't have any "${key}" field.`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          );
        }

        const fieldMetadata =
          objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

        if (isUndefined(value)) {
          continue;
        }

        let coercedValue: unknown;

        switch (fieldMetadata.type) {
          case FieldMetadataType.NUMERIC:
            coercedValue = coerceNumericFieldOrThrow(value, key);
            break;
          case FieldMetadataType.NUMBER:
            coercedValue = coerceNumberFieldOrThrow(value, key);
            break;
          case FieldMetadataType.POSITION:
          case FieldMetadataType.TEXT:
            coercedValue = coerceTextFieldOrThrow(value, key);
            break;
          case FieldMetadataType.DATE_TIME:
          case FieldMetadataType.DATE:
            coercedValue = coerceDateAndDateTimeFieldOrThrow(value, key);
            break;
          case FieldMetadataType.BOOLEAN:
            coercedValue = coerceBooleanFieldOrThrow(value, key);
            break;
          case FieldMetadataType.RATING:
            coercedValue = coerceRatingAndSelectFieldOrThrow(
              value,
              fieldMetadata.options?.map((option) => option.value),
              key,
            );
            break;
          case FieldMetadataType.SELECT:
            coercedValue = coerceRatingAndSelectFieldOrThrow(
              value,
              fieldMetadata.options?.map((option) => option.value),
              key,
            );
            break;
          case FieldMetadataType.MULTI_SELECT:
            coercedValue = coerceMultiSelectFieldOrThrow(
              value,
              fieldMetadata.options?.map((option) => option.value),
              key,
            );
            break;
          case FieldMetadataType.UUID:
            coercedValue = coerceUUIDFieldOrThrow(value, key);
            break;
          case FieldMetadataType.ARRAY:
            coercedValue = coerceArrayFieldOrThrow(value, key);
            break;
          case FieldMetadataType.RAW_JSON:
            coercedValue = coerceRawJsonFieldOrThrow(value, key);
            break;
          case FieldMetadataType.RELATION:
          case FieldMetadataType.MORPH_RELATION: {
            const fieldMetadataRelationSettings =
              fieldMetadata.settings as FieldMetadataRelationSettings;

            if (
              fieldMetadataRelationSettings.relationType ===
              RelationType.ONE_TO_MANY
            ) {
              throw new CommonQueryRunnerException(
                `One-to-many relation ${key} field does not support write operations.`,
                CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
              );
            }

            if (key === fieldMetadataRelationSettings.joinColumnName) {
              coercedValue = coerceUUIDFieldOrThrow(value, key);
              break;
            }

            coercedValue = value;
            break;
          }
          case FieldMetadataType.PHONES:
            coercedValue = coercePhonesFieldOrThrow(value, key);
            break;
          case FieldMetadataType.EMAILS:
            coercedValue = coerceEmailsFieldOrThrow(value, key);
            break;
          case FieldMetadataType.FULL_NAME:
            coercedValue = coerceFullNameFieldOrThrow(value, key);
            break;
          case FieldMetadataType.ADDRESS:
            coercedValue = coerceAddressFieldOrThrow(value, key);
            break;
          case FieldMetadataType.CURRENCY:
            coercedValue = coerceCurrencyFieldOrThrow(value, key);
            break;
          case FieldMetadataType.ACTOR:
            coercedValue = coerceActorFieldOrThrow(value, key);
            break;
          case FieldMetadataType.RICH_TEXT_V2:
            coercedValue = coerceRichTextV2FieldOrThrow(value, key);
            break;
          case FieldMetadataType.LINKS:
            coercedValue = coerceLinksFieldOrThrow(value, key);
            break;
          case FieldMetadataType.RICH_TEXT:
          case FieldMetadataType.TS_VECTOR:
            throw new CommonQueryRunnerException(
              `${key} ${fieldMetadata.type}-typed field does not support write operations`,
              CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
            );
          default:
            assertUnreachable(
              fieldMetadata.type,
              'Should never occur, add coercer for new field type',
            );
        }

        coercedRecord[key] = coercedValue;
      }
      coercedRecords.push(coercedRecord);
    }

    const overriddenPositionRecords =
      await this.recordPositionService.overridePositionOnRecords({
        partialRecordInputs: coercedRecords,
        workspaceId: workspace.id,
        objectMetadata: {
          isCustom: objectMetadataItemWithFieldMaps.isCustom,
          nameSingular: objectMetadataItemWithFieldMaps.nameSingular,
          fieldIdByName: objectMetadataItemWithFieldMaps.fieldIdByName,
        },
        shouldBackfillPositionIfUndefined,
      });

    return overriddenPositionRecords;
  }
}
