import { type StepResult, type ToolSet } from 'ai';

import { type AiToolCallLog } from 'twenty-shared/workflow';

import {
  TRUNCATION_SENTINEL,
  truncateStringToUtf8ByteBudget,
} from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const DEFAULT_MAX_TOOL_INPUT_BYTES = 32_000;
const DEFAULT_MAX_TOOL_OUTPUT_BYTES = 64_000;
const DEFAULT_MAX_TOOL_CALLS_PER_STEP = 200;
const MAX_ERROR_MESSAGE_LENGTH = 2_000;

const NOISY_RECORD_KEYS = new Set(['searchVector']);

const stripNoisyKeysDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(stripNoisyKeysDeep);
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(value)) {
      if (NOISY_RECORD_KEYS.has(key)) {
        continue;
      }

      sanitized[key] = stripNoisyKeysDeep(nested);
    }

    return sanitized;
  }

  return value;
};

const truncateUnknownForLog = (value: unknown, maxBytes: number): unknown => {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value === 'string') {
    const { value: truncatedValue, truncated } = truncateStringToUtf8ByteBudget(
      value,
      maxBytes,
    );

    return truncated ? truncatedValue : value;
  }

  let serialized: string;

  try {
    serialized = JSON.stringify(value);
  } catch {
    return TRUNCATION_SENTINEL;
  }

  const { value: truncatedValue, truncated } = truncateStringToUtf8ByteBudget(
    serialized,
    maxBytes,
  );

  return truncated ? truncatedValue : value;
};

export type MapAiStepsToToolCallLogsOptions = {
  maxToolInputBytes?: number;
  maxToolOutputBytes?: number;
  maxToolCallsPerStep?: number;
};

export const mapAiStepsToToolCallLogs = (
  steps: StepResult<ToolSet>[],
  options: MapAiStepsToToolCallLogsOptions = {},
): AiToolCallLog[] => {
  const maxToolInputBytes =
    options.maxToolInputBytes ?? DEFAULT_MAX_TOOL_INPUT_BYTES;
  const maxToolOutputBytes =
    options.maxToolOutputBytes ?? DEFAULT_MAX_TOOL_OUTPUT_BYTES;
  const maxToolCallsPerStep =
    options.maxToolCallsPerStep ?? DEFAULT_MAX_TOOL_CALLS_PER_STEP;

  const ordered: AiToolCallLog[] = [];
  const openByCallId = new Map<string, AiToolCallLog>();

  for (const step of steps) {
    if (ordered.length >= maxToolCallsPerStep) {
      break;
    }

    for (const part of step.content) {
      if (ordered.length >= maxToolCallsPerStep) {
        break;
      }

      if (part.type === 'tool-call') {
        const entry: AiToolCallLog = {
          toolName: part.toolName,
          toolCallId: part.toolCallId,
          input: truncateUnknownForLog(part.input, maxToolInputBytes),
          state: 'started',
          providerExecuted:
            'providerExecuted' in part && part.providerExecuted === true,
        };
        openByCallId.set(part.toolCallId, entry);
        ordered.push(entry);
        continue;
      }

      if (part.type === 'tool-result') {
        const entry = openByCallId.get(part.toolCallId);

        if (entry) {
          entry.output = truncateUnknownForLog(
            stripNoisyKeysDeep(part.output),
            maxToolOutputBytes,
          );
          entry.state = 'success';
        }
        continue;
      }

      if (part.type === 'tool-error') {
        const entry = openByCallId.get(part.toolCallId);

        if (entry) {
          entry.errorMessage = String(part.error).slice(
            0,
            MAX_ERROR_MESSAGE_LENGTH,
          );
          entry.state = 'error';
        }
        continue;
      }
    }
  }

  return ordered;
};
