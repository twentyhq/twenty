import { Injectable } from '@nestjs/common';

import {
  FieldMetadataType,
  ObjectRecord,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

import { transformEmailsValue } from 'src/engine/core-modules/record-transformer/utils/transform-emails-value.util';
import { transformLinksValue } from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';
import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';
import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class RecordInputTransformerService {
  constructor(private readonly metricsService: MetricsService) {}

  async process({
    recordInput,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: {
    recordInput: Partial<ObjectRecord>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<Partial<ObjectRecord>> {
    let transformedEntries = {};

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    for (const [key, value] of Object.entries(recordInput)) {
      const fieldMetadataId = fieldIdByName[key];
      const fieldMetadata = fieldMetadataId
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })
        : undefined;

      if (!fieldMetadata) {
        transformedEntries = { ...transformedEntries, [key]: value };
        continue;
      }

      const transformedValue = this.parseSubFields(
        fieldMetadata.type,
        await this.transformFieldValue(
          fieldMetadata,
          this.stringifySubFields(fieldMetadata.type, value),
        ),
      );

      transformedEntries = { ...transformedEntries, [key]: transformedValue };
    }

    return transformedEntries;
  }

  private async transformFieldValue(
    fieldMetadata: OrmFlatFieldMetadata,
    // oxlint-disable-next-line typescript/no-explicit-any
    value: any,
    // oxlint-disable-next-line typescript/no-explicit-any
  ): Promise<any> {
    if (!isDefined(value)) {
      return value;
    }

    switch (fieldMetadata.type) {
      case FieldMetadataType.UUID:
        return value || null;
      case FieldMetadataType.NUMBER:
        return value === null ? null : Number(value);
      case FieldMetadataType.RICH_TEXT: {
        const richTextValue = transformRichTextValue(value);

        if (isNonEmptyString(richTextValue.blocknote)) {
          this.metricsService.incrementCounterBy({
            key: MetricsKeys.RichTextBlockNoteWrite,
            amount: 1,
          });
        }

        return richTextValue;
      }
      case FieldMetadataType.LINKS:
        return transformLinksValue({
          input: value,
          settings: isFieldMetadataSettingsOfType(
            fieldMetadata.settings,
            FieldMetadataType.LINKS,
          )
            ? fieldMetadata.settings
            : null,
        });
      case FieldMetadataType.EMAILS:
        return transformEmailsValue(value);
      case FieldMetadataType.PHONES:
        return transformPhonesValue({ input: value });
      default:
        return value;
    }
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  private stringifySubFields(fieldMetadataType: FieldMetadataType, value: any) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadataType);

    if (!compositeType) {
      return value;
    }

    return Object.entries(value).reduce(
      (acc, [subFieldName, subFieldValue]) => {
        const subFieldType = compositeType.properties.find(
          (property) => property.name === subFieldName,
        )?.type;

        if (subFieldType === FieldMetadataType.RAW_JSON) {
          return {
            ...acc,
            [subFieldName]: subFieldValue
              ? JSON.stringify(subFieldValue)
              : subFieldValue,
          };
        }

        return { ...acc, [subFieldName]: subFieldValue };
      },
      {},
    );
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  private parseSubFields(fieldMetadataType: FieldMetadataType, value: any) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadataType);

    if (!compositeType) {
      return value;
    }

    return Object.entries(value).reduce(
      // oxlint-disable-next-line typescript/no-explicit-any
      (acc, [subFieldName, subFieldValue]: [string, any]) => {
        const subFieldType = compositeType.properties.find(
          (property) => property.name === subFieldName,
        )?.type;

        if (subFieldType === FieldMetadataType.RAW_JSON) {
          return {
            ...acc,
            [subFieldName]: subFieldValue
              ? JSON.parse(subFieldValue)
              : subFieldValue,
          };
        }

        return { ...acc, [subFieldName]: subFieldValue };
      },
      {},
    );
  }
}
