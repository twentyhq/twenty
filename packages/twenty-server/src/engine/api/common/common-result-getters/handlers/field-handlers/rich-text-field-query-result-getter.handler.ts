import {
  FieldMetadataType,
  FileFolder,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  getTipTapFileUrlAttributeName,
  isDefined,
  isTipTapNode,
  parseJson,
  type TipTapNode,
} from 'twenty-shared/utils';

import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// oxlint-disable-next-line typescript/no-explicit-any
type RichTextBlock = Record<string, any>;

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

export class RichTextFieldQueryResultGetterHandler implements QueryResultGetterHandlerInterface {
  constructor(private readonly fileUrlService: FileUrlService) {}

  async handle(
    record: ObjectRecord,
    workspaceId: string,
    flatFieldMetadata: FlatFieldMetadata[],
  ): Promise<ObjectRecord> {
    const richTextFields = flatFieldMetadata.filter(
      (field) => field.type === FieldMetadataType.RICH_TEXT,
    );

    if (richTextFields.length === 0) {
      return record;
    }

    for (const field of richTextFields) {
      const fieldValue = record[field.name];

      if (isNonEmptyString(fieldValue?.tiptap)) {
        record[field.name] = {
          ...record[field.name],
          tiptap: await this.signTipTapFileUrls({
            tiptapJson: fieldValue.tiptap,
            workspaceId,
          }),
        };
      }

      if (!isNonEmptyString(fieldValue?.blocknote)) {
        continue;
      }

      const blocknoteBlocks = parseBlocknoteJsonSafely(fieldValue.blocknote);

      if (!isDefined(blocknoteBlocks)) {
        continue;
      }

      const signedBlocks = await this.signBlocknoteImageUrls(
        blocknoteBlocks,
        workspaceId,
      );

      record[field.name] = {
        ...record[field.name],
        blocknote: JSON.stringify(signedBlocks),
      };
    }

    return record;
  }

  signBlocknoteImageUrls = async (
    blocknoteBlocks: RichTextBlock[],
    workspaceId: string,
  ): Promise<RichTextBlock[]> => {
    return Promise.all(
      blocknoteBlocks.map(async (block: RichTextBlock) => {
        if (!isDefined(block.props?.url)) {
          return block;
        }

        const fileIdFromUrl = extractFileIdFromUrl(
          block.props.url,
          FileFolder.FilesField,
        );

        if (!isDefined(fileIdFromUrl)) {
          return block;
        }

        const url = await this.fileUrlService.signFileByIdUrl({
          fileId: fileIdFromUrl,
          workspaceId,
          fileFolder: FileFolder.FilesField,
        });

        return {
          ...block,
          props: {
            ...block.props,
            url,
          },
        };
      }),
    );
  };

  signTipTapFileUrls = async ({
    tiptapJson,
    workspaceId,
  }: {
    tiptapJson: string;
    workspaceId: string;
  }): Promise<string> => {
    const document = parseJson<unknown>(tiptapJson);

    if (!isTipTapNode(document)) {
      return tiptapJson;
    }

    return JSON.stringify(
      await this.signTipTapNodeFileUrls({ node: document, workspaceId }),
    );
  };

  private signTipTapNodeFileUrls = async ({
    node,
    workspaceId,
  }: {
    node: TipTapNode;
    workspaceId: string;
  }): Promise<TipTapNode> => {
    const signedNode = isDefined(node.content)
      ? {
          ...node,
          content: await Promise.all(
            node.content.map((childNode) =>
              this.signTipTapNodeFileUrls({ node: childNode, workspaceId }),
            ),
          ),
        }
      : node;

    const fileUrlAttributeName = getTipTapFileUrlAttributeName(node.type);

    if (!isDefined(fileUrlAttributeName)) {
      return signedNode;
    }

    const fileUrl = node.attrs?.[fileUrlAttributeName];
    const fileIdFromUrl = isString(fileUrl)
      ? extractFileIdFromUrl(fileUrl, FileFolder.FilesField)
      : undefined;

    if (!isDefined(fileIdFromUrl)) {
      return signedNode;
    }

    const url = await this.fileUrlService.signFileByIdUrl({
      fileId: fileIdFromUrl,
      workspaceId,
      fileFolder: FileFolder.FilesField,
    });

    return {
      ...signedNode,
      attrs: { ...signedNode.attrs, [fileUrlAttributeName]: url },
    };
  };
}
