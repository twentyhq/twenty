import { Injectable } from '@nestjs/common';

import { FieldMetadataType, ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { transformEmailsValue } from 'src/engine/core-modules/record-transformer/utils/transform-emails-value.util';
import { transformLinksValue } from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';
import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';
import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class RecordInputTransformerService {
  async process({
    recordInput,
    objectMetadataMapItem,
  }: {
    recordInput: Partial<ObjectRecord>;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
  }): Promise<Partial<ObjectRecord>> {
    let transformedEntries = {};

    for (const [key, value] of Object.entries(recordInput)) {
      const fieldMetadataId = objectMetadataMapItem.fieldIdByName[key];
      const fieldMetadata = objectMetadataMapItem.fieldsById[fieldMetadataId];

      if (!fieldMetadata) {
        transformedEntries = { ...transformedEntries, [key]: value };
        continue;
      }

      const transformedValue = this.parseSubFields(
        fieldMetadata.type,
        await this.transformFieldValue(
          fieldMetadata.type,
          this.stringifySubFields(fieldMetadata.type, value),
        ),
      );

      transformedEntries = { ...transformedEntries, [key]: transformedValue };
    }

    return transformedEntries;
  }

  private async transformFieldValue(
    fieldType: FieldMetadataType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    if (!isDefined(value)) {
      return value;
    }

    switch (fieldType) {
      case FieldMetadataType.UUID:
        return value || null;
      case FieldMetadataType.NUMBER:
        return value === null ? null : Number(value);
      case FieldMetadataType.RICH_TEXT:
        throw new Error(
          'Rich text is not supported, please use RICH_TEXT_V2 instead',
        );
      case FieldMetadataType.RICH_TEXT_V2:
        return await transformRichTextV2Value(value);
      case FieldMetadataType.LINKS:
        return transformLinksValue(value);
      case FieldMetadataType.EMAILS:
        return transformEmailsValue({ input: value });
      case FieldMetadataType.PHONES:
        return transformPhonesValue({ input: value });
      default:
        return value;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseSubFields(fieldMetadataType: FieldMetadataType, value: any) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadataType);

    if (!compositeType) {
      return value;
    }

    return Object.entries(value).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
