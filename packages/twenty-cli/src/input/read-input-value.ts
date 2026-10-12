import { readFile } from 'node:fs/promises';
import { addAbortSignal } from 'node:stream';

import { INPUT_BYTE_LIMIT } from '@/input/constants/input-byte-limit.constant';
import { INPUT_SOURCE_MARKER } from '@/input/constants/input-source-marker.constant';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

const readStandardInput = async (optionName: string, signal: AbortSignal) => {
  const chunks: Buffer[] = [];
  let receivedBytes = 0;

  for await (const chunk of addAbortSignal(signal, process.stdin)) {
    const buffer = Buffer.from(chunk);

    receivedBytes += buffer.byteLength;

    if (receivedBytes > INPUT_BYTE_LIMIT) {
      throw new CliError({
        code: 'INVALID_INPUT',
        exitCode: EXIT_CODE.USAGE,
        message: `Standard input for ${optionName} is larger than ${INPUT_BYTE_LIMIT / 1024 / 1024} MiB.`,
      });
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
};

const readInputFile = async (
  filePath: string,
  optionName: string,
  signal: AbortSignal,
) => {
  try {
    return await readFile(filePath, { encoding: 'utf8', signal });
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }

    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: `Could not read ${filePath} for ${optionName}.`,
      details: {
        reason: error instanceof Error ? error.message : String(error),
      },
    });
  }
};

export const readInputValue = async ({
  value,
  optionName,
  signal,
}: {
  value: string;
  optionName: string;
  signal: AbortSignal;
}) => {
  if (value === INPUT_SOURCE_MARKER.STANDARD_INPUT) {
    return readStandardInput(optionName, signal);
  }

  if (value.startsWith(INPUT_SOURCE_MARKER.FILE_PREFIX)) {
    return readInputFile(
      value.slice(INPUT_SOURCE_MARKER.FILE_PREFIX.length),
      optionName,
      signal,
    );
  }

  return value;
};
