import {
  type FilePart,
  type ModelMessage,
  type TextPart,
  type ToolModelMessage,
} from 'ai';
import { isHttpUrl, isNonEmptyArray } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ModelInputFile } from 'src/engine/core-modules/tool/types/model-input-file.type';

const TOOL_OUTPUT_WITH_MODEL_INPUT_FILE_SCHEMA = z.object({
  modelInputFile: z.object({
    url: z.string().refine(isHttpUrl),
    filename: z.string(),
    mediaType: z.string(),
  }),
});

const extractModelInputFiles = (message: ToolModelMessage): ModelInputFile[] =>
  message.content.flatMap((part) => {
    if (part.type !== 'tool-result' || part.output.type !== 'json') {
      return [];
    }

    const parsedOutput = TOOL_OUTPUT_WITH_MODEL_INPUT_FILE_SCHEMA.safeParse(
      part.output.value,
    );

    return parsedOutput.success ? [parsedOutput.data.modelInputFile] : [];
  });

export const insertModelInputFileMessages = (
  messages: ModelMessage[],
): ModelMessage[] =>
  messages.flatMap((message): ModelMessage[] => {
    if (message.role !== 'tool') {
      return [message];
    }

    const modelInputFiles = extractModelInputFiles(message);

    if (!isNonEmptyArray(modelInputFiles)) {
      return [message];
    }

    return [
      message,
      {
        role: 'user',
        content: modelInputFiles.flatMap(
          ({ url, filename, mediaType }): (TextPart | FilePart)[] => [
            { type: 'text', text: `Content of ${filename}:` },
            { type: 'file', data: url, filename, mediaType },
          ],
        ),
      },
    ];
  });
