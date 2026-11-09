import {
  type LanguageModelV4FilePart,
  type LanguageModelV4Prompt,
} from '@ai-sdk/provider';

export const getPromptFileParts = (
  prompt: LanguageModelV4Prompt,
): LanguageModelV4FilePart[] =>
  prompt.flatMap((message) =>
    message.role === 'user'
      ? message.content.filter((part) => part.type === 'file')
      : [],
  );
