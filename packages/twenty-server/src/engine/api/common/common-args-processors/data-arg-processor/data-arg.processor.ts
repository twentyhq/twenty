import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNull, isUndefined } from '@sniptt/guards';
import {
  FieldMetadataRelationSettings,
  FieldMetadataType,
  ObjectRecord,
  RelationType,
} from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  assertUnreachable,
  isDefined,
} from 'twenty-shared/utils';

import { transformActorField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-actor-field.util';
import { transformAddressField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-address-field.util';
import { transformArrayField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-array-field.util';
import { transformCurrencyField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-currency-field.util';
import { transformFullNameField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-full-name-field.util';
import { transformNumericField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-numeric-field.util';
import { transformRawJsonField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-raw-json-field.util';
import { transformTextField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-text-field.util';
import { validateActorFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-actor-field-or-throw.util';
import { validateAddressFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-address-field-or-throw.util';
import { validateArrayFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-array-field-or-throw.util';
import { validateBooleanFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-boolean-field-or-throw.util';
import { validateCurrencyFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-currency-field-or-throw.util';
import { validateDateAndDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-date-and-date-time-field-or-throw.util';
import { validateEmailsFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-emails-field-or-throw.util';
import { validateFullNameFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-full-name-field-or-throw.util';
import { validateLinksFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-links-field-or-throw.util';
import { validateMultiSelectFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-multi-select-field-or-throw.util';
import { validateNumberFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-number-field-or-throw.util';
import { validateNumericFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-numeric-field-or-throw.util';
import { validateOverriddenPositionFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-overridden-position-field-or-throw.util';
import { validatePhonesFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-phones-field-or-throw.util';
import { validateRatingAndSelectFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rating-and-select-field-or-throw.util';
import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateRichTextV2FieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rich-text-v2-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import { validateUUIDFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-uuid-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { transformEmailsValue } from 'src/engine/core-modules/record-transformer/utils/transform-emails-value.util';
import { transformLinksValue } from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';
import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';
import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class DataArgProcessor {
  constructor(private readonly recordPositionService: RecordPositionService) {}

  async process({
    partialRecordInputs,
    authContext,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    shouldBackfillPositionIfUndefined = true,
  }: {
    partialRecordInputs: Partial<ObjectRecord>[] | undefined;
    authContext: AuthContext;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    shouldBackfillPositionIfUndefined?: boolean;
  }): Promise<Partial<ObjectRecord>[]> {
    if (!isDefined(partialRecordInputs)) {
      return [];
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const { fieldIdByName, fieldIdByJoinColumnName } =
      buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );

    const overriddenPositionRecords =
      await this.recordPositionService.overridePositionOnRecords({
        partialRecordInputs: partialRecordInputs,
        workspaceId: workspace.id,
        objectMetadata: {
          isCustom: flatObjectMetadata.isCustom,
          nameSingular: flatObjectMetadata.nameSingular,
          fieldIdByName,
        },
        shouldBackfillPositionIfUndefined,
      });

    const processedRecords: Partial<ObjectRecord>[] = [];

    for (const record of overriddenPositionRecords) {
      const processedRecord: Partial<ObjectRecord> = {};

      for (const [key, value] of Object.entries(record)) {
        const fieldMetadataId =
          fieldIdByName[key] || fieldIdByJoinColumnName[key];

        if (!isDefined(fieldMetadataId)) {
          throw new CommonQueryRunnerException(
            `Object ${flatObjectMetadata.nameSingular} doesn't have any "${key}" field.`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }

        const fieldMetadata = flatFieldMetadataMaps.byId[fieldMetadataId];

        if (!fieldMetadata) {
          throw new CommonQueryRunnerException(
            `Field metadata not found for field ${key}`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }

        if (
          !isDefined(fieldMetadata.defaultValue) &&
          !fieldMetadata.isNullable &&
          isNull(value)
        ) {
          throw new CommonQueryRunnerException(
            `Field ${key} is not nullable and has no default value.`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
            { userFriendlyMessage: msg`A required field is missing.` },
          );
        }

        if (isUndefined(value)) {
          continue;
        }

        processedRecord[key] = await this.processField(
          fieldMetadata,
          key,
          value,
        );
      }
      processedRecords.push(processedRecord);
    }

    return processedRecords;
  }

  private async processField(
    fieldMetadata: FlatFieldMetadata,
    key: string,
    value: unknown,
  ): Promise<unknown> {
    switch (fieldMetadata.type) {
      case FieldMetadataType.POSITION:
        return validateOverriddenPositionFieldOrThrow(value, key);
      case FieldMetadataType.NUMERIC: {
        const validatedValue = validateNumericFieldOrThrow(value, key);

        return transformNumericField(validatedValue);
      }
      case FieldMetadataType.NUMBER: {
        return validateNumberFieldOrThrow(value, key);
      }
      case FieldMetadataType.TEXT: {
        const validatedValue = validateTextFieldOrThrow(value, key);

        return transformTextField(validatedValue);
      }
      case FieldMetadataType.DATE_TIME:
      case FieldMetadataType.DATE:
        return validateDateAndDateTimeFieldOrThrow(value, key);
      case FieldMetadataType.BOOLEAN:
        return validateBooleanFieldOrThrow(value, key);
      case FieldMetadataType.RATING:
      case FieldMetadataType.SELECT: {
        validateRatingAndSelectFieldOrThrow(
          value,
          key,
          fieldMetadata.options?.map((option) => option.value),
        );

        return value;
      }

      case FieldMetadataType.MULTI_SELECT: {
        const validatedValue = validateMultiSelectFieldOrThrow(
          value,
          key,
          fieldMetadata.options?.map((option) => option.value),
        );

        return transformArrayField(validatedValue);
      }
      case FieldMetadataType.UUID:
        return validateUUIDFieldOrThrow(value, key);
      case FieldMetadataType.ARRAY: {
        const validatedValue = validateArrayFieldOrThrow(value, key);

        return transformArrayField(validatedValue);
      }
      case FieldMetadataType.RAW_JSON: {
        const validatedValue = validateRawJsonFieldOrThrow(value, key);

        return transformRawJsonField(validatedValue);
      }
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
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }

        if (key === fieldMetadataRelationSettings.joinColumnName) {
          return validateUUIDFieldOrThrow(value, key);
        }

        return value;
      }
      case FieldMetadataType.PHONES: {
        const validatedValue = validatePhonesFieldOrThrow(value, key);

        return transformPhonesValue({ input: validatedValue });
      }
      case FieldMetadataType.EMAILS: {
        const validatedValue = validateEmailsFieldOrThrow(value, key);

        return transformEmailsValue(validatedValue);
      }
      case FieldMetadataType.FULL_NAME: {
        const validatedValue = validateFullNameFieldOrThrow(value, key);

        return transformFullNameField(validatedValue);
      }

      case FieldMetadataType.ADDRESS: {
        const validatedValue = validateAddressFieldOrThrow(value, key);

        return transformAddressField(validatedValue);
      }
      case FieldMetadataType.CURRENCY: {
        const validatedValue = validateCurrencyFieldOrThrow(value, key);

        return transformCurrencyField(validatedValue);
      }
      case FieldMetadataType.ACTOR: {
        const validatedValue = validateActorFieldOrThrow(value, key);

        return transformActorField(validatedValue);
      }
      case FieldMetadataType.RICH_TEXT_V2: {
        const validatedValue = validateRichTextV2FieldOrThrow(value, key);

        return await transformRichTextV2Value(validatedValue);
      }
      case FieldMetadataType.LINKS: {
        const validatedValue = validateLinksFieldOrThrow(value, key);

        return transformLinksValue(validatedValue);
      }
      case FieldMetadataType.RICH_TEXT:
      case FieldMetadataType.TS_VECTOR:
        throw new CommonQueryRunnerException(
          `${key} ${fieldMetadata.type}-typed field does not support write operations`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      default:
        assertUnreachable(
          fieldMetadata.type,
          'Should never occur, add validator for new field type',
        );
    }
  }
}
