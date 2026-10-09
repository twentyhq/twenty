import type { PrintCallback } from '@pydantic/monty';

const TRUNCATION_MARKER = '\n[output truncated]';

export type ScriptOutputCollector = {
  onPrint: PrintCallback;
  getOutput: () => { stdout: string; stderr: string };
};

export const createScriptOutputCollector = (
  maxLengthPerStream: number,
): ScriptOutputCollector => {
  const output = { stdout: '', stderr: '' };
  const truncatedStreams = new Set<keyof typeof output>();

  return {
    onPrint: (stream, text) => {
      if (truncatedStreams.has(stream)) {
        return;
      }

      const remainingLength = maxLengthPerStream - output[stream].length;

      if (text.length <= remainingLength) {
        output[stream] += text;

        return;
      }

      output[stream] += `${text.slice(0, remainingLength)}${TRUNCATION_MARKER}`;
      truncatedStreams.add(stream);
    },
    getOutput: () => ({ ...output }),
  };
};
