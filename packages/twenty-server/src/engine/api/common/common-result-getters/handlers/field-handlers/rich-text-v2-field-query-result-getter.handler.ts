import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RichTextBlock = Record<string, any>;

const signBlocknoteImageUrls = (
  blocknoteBlocks: RichTextBlock[],
  workspaceId: string,
  fileService: FileService,
): RichTextBlock[] => {
  return blocknoteBlocks.map((block: RichTextBlock) => {
    if (block.type !== 'image' || !block.props?.url) {
      return block;
    }

    let url: URL;

    try {
      url = new URL(block.props.url);
    } catch {
      return block;
    }

    const pathname = url.pathname;
    const isLinkExternal = !pathname.startsWith('/files/attachment/');

    if (isLinkExternal) {
      return block;
    }

    const fileName = pathname.match(/files\/attachment\/(?:.+)\/(.+)$/)?.[1];

    if (!isDefined(fileName)) {
      return block;
    }

    const signedPath = fileService.signFileUrl({
      url: `attachment/${fileName}`,
      workspaceId,
    });

    return {
      ...block,
      props: {
        ...block.props,
        url: `${process.env.SERVER_URL}/files/${signedPath}`,
      },
    };
  });
};

const parseBlocknoteJsonSafely = (
  blocknoteJson: string,
): RichTextBlock[] | null => {
  try {
    const parsed = JSON.parse(blocknoteJson);

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export class RichTextV2FieldQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(private readonly fileService: FileService) {}

  async handle(
    record: ObjectRecord,
    workspaceId: string,
    flatFieldMetadata: FlatFieldMetadata[],
  ): Promise<ObjectRecord> {
    const richTextV2Fields = flatFieldMetadata.filter(
      (field) => field.type === FieldMetadataType.RICH_TEXT_V2,
    );

    if (richTextV2Fields.length === 0) {
      return record;
    }

    for (const field of richTextV2Fields) {
      const fieldValue = record[field.name];
      const blocknoteJson = fieldValue?.blocknote;

      if (!blocknoteJson || typeof blocknoteJson !== 'string') {
        continue;
      }

      const blocknoteBlocks = parseBlocknoteJsonSafely(blocknoteJson);

      if (!isDefined(blocknoteBlocks)) {
        continue;
      }

      const signedBlocks = signBlocknoteImageUrls(
        blocknoteBlocks,
        workspaceId,
        this.fileService,
      );

      record[field.name] = {
        ...fieldValue,
        blocknote: JSON.stringify(signedBlocks),
      };
    }

    return record;
  }
}
