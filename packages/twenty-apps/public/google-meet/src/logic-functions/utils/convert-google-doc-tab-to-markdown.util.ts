import { isDefined } from 'twenty-sdk/utils';

import { type GoogleDocTab } from 'src/logic-functions/types/google-doc-tab.type';
import { convertGoogleDocParagraphToMarkdown } from 'src/logic-functions/utils/convert-google-doc-paragraph-to-markdown.util';

type MarkdownBlock = { markdown: string; isListItem: boolean };

const getBlockSeparator = ({
  previousBlock,
  block,
}: {
  previousBlock: MarkdownBlock | undefined;
  block: MarkdownBlock;
}): string => {
  if (!isDefined(previousBlock)) {
    return '';
  }

  return previousBlock.isListItem && block.isListItem ? '\n' : '\n\n';
};

export const convertGoogleDocTabToMarkdown = (tab: GoogleDocTab): string => {
  const lists = tab.documentTab?.lists ?? {};
  const blocks = (tab.documentTab?.body?.content ?? []).flatMap(
    ({ paragraph }): MarkdownBlock[] => {
      if (!isDefined(paragraph)) {
        return [];
      }

      const markdown = convertGoogleDocParagraphToMarkdown({
        paragraph,
        lists,
      });

      if (!isDefined(markdown)) {
        return [];
      }

      return [{ markdown, isListItem: isDefined(paragraph.bullet) }];
    },
  );

  return blocks
    .map(
      (block, index) =>
        `${getBlockSeparator({ previousBlock: blocks[index - 1], block })}${block.markdown}`,
    )
    .join('');
};
