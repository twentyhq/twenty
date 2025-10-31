import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import {
  AtomicFieldMetadataType,
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

import { coerceArrayFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-array-field-or-throw.util';
import { coerceBooleanFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-boolean-field-or-throw.util';
import { coerceDateAndDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-date-and-date-time-field-or-throw.util';
import { coerceMultiSelectFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-multi-select-field-or-throw.util';
import { coerceNumberFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-number-field-or-throw.util';
import { coerceNumericFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-numeric-field-or-throw.util';
import { coerceRatingAndSelectFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-rating-and-select-field-or-throw.util';
import { coerceRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-raw-json-field-or-throw.util';
import { coerceTextFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-text-field-or-throw.util';
import { coerceUUIDFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-uuid-field-or-throw.util';
import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { transformEmailsValue } from 'src/engine/core-modules/record-transformer/utils/transform-emails-value.util';
import {
  LinksFieldGraphQLInput,
  transformLinksValue,
} from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';
import {
  PhonesFieldGraphQLInput,
  transformPhonesValue,
} from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';
import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

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

    const coercedAndTransformedRecords: Partial<ObjectRecord>[] = [];

    for (const record of partialRecordInputs) {
      const coercedAndTransformedRecord: Partial<ObjectRecord> = {};

      for (const [key, value] of Object.entries(record)) {
        const fieldMetadataId =
          objectMetadataItemWithFieldMaps.fieldIdByName[key] ||
          objectMetadataItemWithFieldMaps.fieldIdByJoinColumnName[key];

        if (!isDefined(fieldMetadataId)) {
          throw new CommonQueryRunnerException(
            `Object ${objectMetadataItemWithFieldMaps.nameSingular} does not have a field with name "${key}"`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          );
        }

        const fieldMetadata =
          objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

        if (
          [FieldMetadataType.TS_VECTOR, FieldMetadataType.RICH_TEXT].includes(
            fieldMetadata.type,
          )
        ) {
          throw new CommonQueryRunnerException(
            `${key} ${fieldMetadata.type}-typed field does not support write operations`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          );
        }

        if (isUndefined(value)) {
          continue;
        }

        let coercedValue: unknown;

        if (isCompositeFieldMetadataType(fieldMetadata.type)) {
          coercedValue = this.coerceCompositeFieldValueOrThrow(
            value as Record<string, unknown>,
            fieldMetadata as FieldMetadataEntity<CompositeFieldMetadataType>,
          );
        } else {
          coercedValue = this.coerceAtomicFieldValueOrThrow(
            key,
            value,
            fieldMetadata.type as Exclude<
              AtomicFieldMetadataType,
              'TS_VECTOR' | 'RICH_TEXT'
            >,
            fieldMetadata?.options,
            fieldMetadata?.settings as FieldMetadataRelationSettings | null,
          );
        }

        if (
          ![
            FieldMetadataType.RICH_TEXT_V2,
            FieldMetadataType.LINKS,
            FieldMetadataType.EMAILS,
            FieldMetadataType.PHONES,
          ].includes(fieldMetadata.type)
        ) {
          coercedAndTransformedRecord[key] = coercedValue;
          continue;
        }

        let transformedValue: unknown;

        switch (fieldMetadata.type) {
          case FieldMetadataType.RICH_TEXT_V2:
            transformedValue = await transformRichTextV2Value(coercedValue);
            break;
          case FieldMetadataType.LINKS:
            transformedValue = transformLinksValue(
              coercedValue as LinksFieldGraphQLInput,
            );
            break;
          case FieldMetadataType.EMAILS:
            transformedValue = transformEmailsValue(coercedValue);
            break;
          case FieldMetadataType.PHONES:
            transformedValue = transformPhonesValue({
              input: coercedValue as PhonesFieldGraphQLInput,
            });
            break;
        }
        coercedAndTransformedRecord[key] = transformedValue;
      }
      coercedAndTransformedRecords.push(coercedAndTransformedRecord);
    }

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

    return overriddenPositionRecords;
  }

  private coerceAtomicFieldValueOrThrow(
    fieldName: string,
    value: unknown,
    fieldMetadataType: Exclude<
      AtomicFieldMetadataType,
      'TS_VECTOR' | 'RICH_TEXT'
    >,
    fieldMetadataOptions?: FieldMetadataDefaultOption[] | null,
    fieldMetadataRelationSettings?: FieldMetadataRelationSettings | null,
  ) {
    switch (fieldMetadataType) {
      case FieldMetadataType.NUMERIC:
        return coerceNumericFieldOrThrow(value, fieldName);
      case FieldMetadataType.NUMBER:
        return coerceNumberFieldOrThrow(value, fieldName);
      case FieldMetadataType.POSITION:
      case FieldMetadataType.TEXT:
        return coerceTextFieldOrThrow(value, fieldName);
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME:
        return coerceDateAndDateTimeFieldOrThrow(value, fieldName);
      case FieldMetadataType.BOOLEAN:
        return coerceBooleanFieldOrThrow(value, fieldName);
      case FieldMetadataType.RATING:
      case FieldMetadataType.SELECT:
        return coerceRatingAndSelectFieldOrThrow(
          value,
          fieldMetadataOptions?.map((option) => option.value),
          fieldName,
        );
      case FieldMetadataType.MULTI_SELECT:
        return coerceMultiSelectFieldOrThrow(
          value,
          fieldMetadataOptions?.map((option) => option.value),
          fieldName,
        );
      case FieldMetadataType.UUID:
        return coerceUUIDFieldOrThrow(value, fieldName);
      case FieldMetadataType.ARRAY:
        return coerceArrayFieldOrThrow(value, fieldName);
      case FieldMetadataType.RAW_JSON:
        return coerceRawJsonFieldOrThrow(value, fieldName);
      case FieldMetadataType.RELATION:
      case FieldMetadataType.MORPH_RELATION: {
        if (
          fieldMetadataRelationSettings?.relationType ===
            RelationType.MANY_TO_ONE &&
          fieldName === fieldMetadataRelationSettings.joinColumnName
        ) {
          return coerceUUIDFieldOrThrow(value, fieldName);
        }

        return value;
      }
      default:
        assertUnreachable(
          fieldMetadataType,
          'Should never occur, add coercer for new field type',
        );
    }
  }

  private coerceCompositeFieldValueOrThrow(
    value: Record<string, unknown>,
    fieldMetadata: FieldMetadataEntity<CompositeFieldMetadataType>,
  ) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!isDefined(compositeType)) {
      throw new CommonDataCoercerException(
        `Composite type definition not found for field ${fieldMetadata.name} of type ${fieldMetadata.type}`,
        CommonDataCoercerExceptionCode.INVALID_COMPOSITE_FIELD,
      );
    }

    return Object.entries(value).reduce(
      (acc, [subFieldName, subFieldValue]) => {
        const subFieldMetadata = compositeType.properties.find(
          (property) => property.name === subFieldName,
        );

        if (!isDefined(subFieldMetadata)) {
          throw new CommonDataCoercerException(
            `Sub field ${subFieldName} not found for composite field ${fieldMetadata.name} of type ${fieldMetadata.type}`,
            CommonDataCoercerExceptionCode.INVALID_COMPOSITE_FIELD,
          );
        }

        const coercedFieldValue = this.coerceAtomicFieldValueOrThrow(
          subFieldName,
          subFieldValue,
          subFieldMetadata.type as Exclude<
            AtomicFieldMetadataType,
            'TS_VECTOR' | 'RICH_TEXT'
          >,
          subFieldMetadata?.options,
        );

        //TODO: Refacto-common - move this to each transformer function
        const stringifiedFieldValue =
          subFieldMetadata.type === FieldMetadataType.RAW_JSON
            ? JSON.stringify(coercedFieldValue)
            : coercedFieldValue;

        return {
          ...acc,
          [subFieldName]: stringifiedFieldValue,
        };
      },
      {},
    );
  }
}
