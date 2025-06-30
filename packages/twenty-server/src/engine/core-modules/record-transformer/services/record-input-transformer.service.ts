import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { transformLinksValue } from 'src/engine/core-modules/record-transformer/utils/transform-links-value.util';
import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  RichTextV2Metadata,
  richTextV2ValueSchema,
} from 'src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

@Injectable()
export class RecordInputTransformerService {
  async process({
    recordInput,
    objectMetadataMapItem,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recordInput: Record<string, any>;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<Record<string, any>> {
    if (!recordInput) {
      return recordInput;
    }

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

  async transformFieldValue(
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
        return this.transformRichTextV2Value(value);
      case FieldMetadataType.LINKS:
        return transformLinksValue(value);
      case FieldMetadataType.EMAILS:
        return this.transformEmailsValue(value);
      case FieldMetadataType.PHONES:
        return transformPhonesValue({ input: value });
      default:
        return value;
    }
  }

  private async transformRichTextV2Value(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    richTextValue: any,
  ): Promise<RichTextV2Metadata> {
    const parsedValue = richTextV2ValueSchema.parse(richTextValue);

    const { ServerBlockNoteEditor } = await import('@blocknote/server-util');

    const serverBlockNoteEditor = ServerBlockNoteEditor.create();

    // Patch: Handle cases where blocknote to markdown conversion fails for certain block types (custom/code blocks)
    // Todo : This may be resolved once the server-utils library is updated with proper conversion support - #947
    let convertedMarkdown: string | null = null;

    try {
      convertedMarkdown = isDefined(parsedValue.blocknote)
        ? await serverBlockNoteEditor.blocksToMarkdownLossy(
            JSON.parse(parsedValue.blocknote),
          )
        : null;
    } catch {
      convertedMarkdown = parsedValue.blocknote || null;
    }

    const convertedBlocknote = parsedValue.markdown
      ? JSON.stringify(
          await serverBlockNoteEditor.tryParseMarkdownToBlocks(
            parsedValue.markdown,
          ),
        )
      : null;

    return {
      markdown: parsedValue.markdown || convertedMarkdown,
      blocknote: parsedValue.blocknote || convertedBlocknote,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformEmailsValue(value: any): any {
    if (!value) {
      return value;
    }

    let additionalEmails = value?.additionalEmails;
    const primaryEmail = value?.primaryEmail
      ? value.primaryEmail.toLowerCase()
      : '';

    if (additionalEmails) {
      try {
        const emailArray = JSON.parse(additionalEmails) as string[];

        additionalEmails = JSON.stringify(
          emailArray.map((email) => email.toLowerCase()),
        );
      } catch {
        /* empty */
      }
    }

    return {
      primaryEmail,
      additionalEmails,
    };
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
