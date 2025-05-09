import { Injectable } from '@nestjs/common';

import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { lowercaseDomain } from 'src/engine/api/graphql/workspace-query-runner/utils/query-runner-links.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { LinkMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
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
    recordInput: Record<string, any>;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
  }): Promise<Record<string, any>> {
    if (!recordInput) {
      return recordInput;
    }

    const fieldMetadataByFieldName = objectMetadataMapItem.fields.reduce(
      (acc, field) => {
        acc[field.name] = field;

        return acc;
      },
      {} as Record<string, FieldMetadataInterface>,
    );

    let transformedEntries = {};

    for (const [key, value] of Object.entries(recordInput)) {
      const fieldMetadata = fieldMetadataByFieldName[key];

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
    value: any,
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
        return this.transformLinksValue(value);
      case FieldMetadataType.EMAILS:
        return this.transformEmailsValue(value);
      default:
        return value;
    }
  }

  private async transformRichTextV2Value(
    richTextValue: any,
  ): Promise<RichTextV2Metadata> {
    const parsedValue = richTextV2ValueSchema.parse(richTextValue);

    const serverBlockNoteEditor = ServerBlockNoteEditor.create();

    //patch : some block (custom or code) conversion to markdown fails
    let convertedMarkdown: string | null = null;

    try {
      convertedMarkdown = parsedValue.blocknote
        ? await serverBlockNoteEditor.blocksToMarkdownLossy(
            JSON.parse(parsedValue.blocknote),
          )
        : null;
    } catch {
      convertedMarkdown = parsedValue.blocknote;
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

  private transformLinksValue(value: any): any {
    if (!value) {
      return value;
    }

    const newPrimaryLinkUrl = lowercaseDomain(value?.primaryLinkUrl);

    let secondaryLinks = value?.secondaryLinks;

    if (secondaryLinks) {
      try {
        const secondaryLinksArray = JSON.parse(secondaryLinks);

        secondaryLinks = JSON.stringify(
          secondaryLinksArray.map((link: LinkMetadata) => {
            return {
              ...link,
              url: lowercaseDomain(link.url),
            };
          }),
        );
      } catch {
        /* empty */
      }
    }

    return {
      ...value,
      primaryLinkUrl: newPrimaryLinkUrl,
      secondaryLinks,
    };
  }

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

  private parseSubFields(fieldMetadataType: FieldMetadataType, value: any) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadataType);

    if (!compositeType) {
      return value;
    }

    return Object.entries(value).reduce(
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
