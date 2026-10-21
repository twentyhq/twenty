import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { createProgressOutput } from '@/output/create-progress-output';
import { JSON_SCHEMA_VERSION } from '@/output/constants/json-schema-version.constant';
import { formatFailureLine, formatWarningLine } from '@/output/style';
import { type CliWarning } from '@/output/types/cli-warning.type';
import { type OutputMode } from '@/output/types/output-mode.type';
import { type Output } from '@/output/types/output.type';
import { writeLine } from '@/output/write-line';
import { writeStreamEvent } from '@/output/write-stream-event';
import { type PublicTarget } from '@/target/types/public-target.type';

const writeJsonLine = (value: unknown) => {
  writeLine({ stream: process.stdout, text: JSON.stringify(value) });
};

const indentLines = (text: string) =>
  text
    .split('\n')
    .map((line) => (isNonEmptyString(line) ? `  ${line}` : line))
    .join('\n');

const withTarget = (target: PublicTarget | undefined) =>
  isDefined(target) ? { target } : {};

export const createOutput = ({
  mode,
  command,
}: {
  mode: OutputMode;
  command: string;
}): Output => {
  const warnings: CliWarning[] = [];
  const progressOutput = createProgressOutput({ mode });
  let eventSequence = 0;

  const writeEvent = (type: string, data: unknown) => {
    eventSequence += 1;
    writeJsonLine({
      schemaVersion: JSON_SCHEMA_VERSION,
      command,
      type,
      sequence: eventSequence,
      data,
    });
  };

  const writeHumanWarnings = () => {
    for (const warning of warnings) {
      writeLine({
        stream: process.stderr,
        text: formatWarningLine(warning.message),
      });
    }
  };

  return {
    event: async (type, data, signal) => {
      if (mode !== 'ndjson') {
        return;
      }

      eventSequence += 1;
      await writeStreamEvent(
        {
          schemaVersion: JSON_SCHEMA_VERSION,
          command,
          type,
          sequence: eventSequence,
          data,
        },
        signal,
      );
    },
    progress: ({ message, percentage }) => {
      if (mode === 'ndjson') {
        writeEvent('progress', { message, percentage });

        return;
      }

      progressOutput.write({ message, percentage });
    },
    warn: (warning) => {
      progressOutput.clear();

      if (mode === 'ndjson') {
        writeEvent('warning', warning);

        return;
      }

      warnings.push(warning);
    },
    succeed: ({ data, human }, target) => {
      progressOutput.clear();

      if (mode === 'json') {
        writeJsonLine({
          schemaVersion: JSON_SCHEMA_VERSION,
          ok: true,
          command,
          ...withTarget(target),
          data,
          warnings,
        });

        return;
      }

      if (mode === 'ndjson') {
        writeEvent('result', data);

        return;
      }

      const humanText = human ?? JSON.stringify(data, null, 2);

      if (isNonEmptyString(humanText)) {
        writeLine({ stream: process.stdout, text: humanText });
      }

      writeHumanWarnings();
    },
    fail: (error, target) => {
      progressOutput.clear();

      process.exitCode = error.exitCode;

      const errorPayload = {
        code: error.code,
        message: error.message,
        ...(isDefined(error.hint) ? { hint: error.hint } : {}),
        ...(isDefined(error.details) ? { details: error.details } : {}),
      };

      if (mode === 'json') {
        writeJsonLine({
          schemaVersion: JSON_SCHEMA_VERSION,
          ok: false,
          command,
          ...withTarget(target),
          error: errorPayload,
          warnings,
        });

        return;
      }

      if (mode === 'ndjson') {
        writeEvent('error', errorPayload);

        return;
      }

      writeLine({
        stream: process.stderr,
        text: formatFailureLine(error.message),
      });

      if (isDefined(error.hint)) {
        writeLine({ stream: process.stderr, text: indentLines(error.hint) });
      }

      writeHumanWarnings();
    },
  };
};
