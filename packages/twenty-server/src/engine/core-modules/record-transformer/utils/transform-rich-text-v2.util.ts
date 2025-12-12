import { Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type RichTextV2Metadata,
  richTextV2ValueSchema,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const logger = new Logger('TransformRichTextV2');

const calculateInputSize = (input: unknown): number => {
  if (typeof input === 'string') {
    return Buffer.byteLength(input, 'utf8');
  }
  if (typeof input === 'object' && input !== null) {
    return Buffer.byteLength(JSON.stringify(input), 'utf8');
  }

  return 0;
};

export const transformRichTextV2Value = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  richTextValue: any,
): Promise<RichTextV2Metadata> => {
  const startTime = Date.now();
  const inputSize = calculateInputSize(richTextValue);

  const parsedValue = isNonEmptyString(richTextValue)
    ? richTextV2ValueSchema.parse(richTextValue)
    : richTextValue;

  const afterParsingTime = Date.now();
  const parsingDuration = afterParsingTime - startTime;

  logger.log(
    `Input parsed - duration: ${parsingDuration}ms, size: ${inputSize} bytes, has_blocknote: ${!!parsedValue.blocknote}, has_markdown: ${!!parsedValue.markdown}`,
  );

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

  const afterMarkdownConversionTime = Date.now();
  const markdownConversionDuration =
    afterMarkdownConversionTime - afterParsingTime;

  logger.debug(
    `Markdown conversion completed - duration: ${markdownConversionDuration}ms, blocknote_length: ${parsedValue.blocknote?.length || 0}, conversion_succeeded: ${!!convertedMarkdown}`,
  );

  const convertedBlocknote = parsedValue.markdown
    ? JSON.stringify(
        await serverBlockNoteEditor.tryParseMarkdownToBlocks(
          parsedValue.markdown,
        ),
      )
    : null;

  const totalDuration = Date.now() - startTime;
  const blocknoteConversionDuration =
    totalDuration - markdownConversionDuration - parsingDuration;

  logger.debug(
    `transformRichTextV2Value completed - total: ${totalDuration}ms, parsing: ${parsingDuration}ms, markdown_conversion: ${markdownConversionDuration}ms, blocknote_conversion: ${blocknoteConversionDuration}ms, size: ${inputSize} bytes`,
  );

  return {
    markdown: parsedValue.markdown || convertedMarkdown,
    blocknote: parsedValue.blocknote || convertedBlocknote,
  };
};
