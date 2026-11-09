import { type LanguageModelV4Prompt } from '@ai-sdk/provider';
import { APICallError } from 'ai';

import { getPromptFileParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/get-prompt-file-parts.util';

const FILE_REJECTION_STATUS_CODES = new Set([400, 422]);

export const isFileRejectedByProvider = (
  error: unknown,
  prompt: LanguageModelV4Prompt,
): error is APICallError =>
  APICallError.isInstance(error) &&
  FILE_REJECTION_STATUS_CODES.has(error.statusCode ?? 0) &&
  getPromptFileParts(prompt).length > 0;
