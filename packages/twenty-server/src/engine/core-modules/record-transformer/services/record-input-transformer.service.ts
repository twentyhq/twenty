import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ServerBlockNoteEditor } from '@blocknote/server-util';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  RichTextV2Metadata,
  richTextV2ValueSchema,
} from 'src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type';
import { lowercaseDomain } from 'src/engine/api/graphql/workspace-query-runner/utils/query-runner-links.util';
import { LinkMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';

@Injectable()
export class RecordInputTransformerService {
  async process({
    recordInput,
    fieldMetadataByFieldName,
  }: {
    recordInput: Record<string, any>;
    fieldMetadataByFieldName: Record<string, FieldMetadataInterface>;
  }): Promise<Record<string, any>> {
    if (!recordInput) {
      return recordInput;
    }

    const transformedEntries = await Promise.all(
      Object.entries(recordInput).map(async ([key, value]) => {
        const fieldMetadata = fieldMetadataByFieldName[key];

        if (!fieldMetadata) {
          return [key, value];
        }

        return [key, await this.transformFieldValue(fieldMetadata.type, value)];
      }),
    );

    return Object.fromEntries(transformedEntries);
  }

  async transformFieldValue(
    fieldType: FieldMetadataType,
    value: any,
  ): Promise<any> {
    if (!isDefined(value)) {
      return value;
    }

    switch (fieldType) {
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

    const convertedMarkdown = parsedValue.blocknote
      ? await serverBlockNoteEditor.blocksToMarkdownLossy(
          JSON.parse(parsedValue.blocknote),
        )
      : null;

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
}
