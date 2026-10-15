import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject, isValidUuid } from 'twenty-shared/utils';

import {
  readBooleanOption,
  readStringArgument,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { createExportFile } from '@/data/export/create-export-file';
import { downloadRecordExport } from '@/data/export/download-record-export';
import { fetchExportFields } from '@/data/export/fetch-export-fields';
import { parseExportFilter } from '@/data/export/parse-export-filter';
import { parseExportOrderBy } from '@/data/export/parse-export-order-by';
import { resolveMetadataObject } from '@/metadata/resolve-metadata-object';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatSuccessLine } from '@/output/style';
import { toPublicTarget } from '@/target/to-public-target';
import { subscribeGraphql } from '@/transport/graphql/subscribe-graphql';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

const invalidInput = (message: string) =>
  new CliError({ code: 'USAGE', exitCode: EXIT_CODE.USAGE, message });
const invalidExport = () =>
  new CliError({
    code: 'INVALID_RESPONSE',
    message: 'The server returned invalid export progress.',
  });

export const runDataExportCommand: CommandRun<TargetCommandContext> = async ({
  arguments: commandArguments,
  options,
  target,
  signal,
  output,
  outputMode,
}) => {
  const path = readStringOption(options, 'output');
  if (!isDefined(path) || path.trim().length === 0 || path === '-') {
    throw invalidInput('--output must name a destination CSV file.');
  }
  const fieldsText = readStringOption(options, 'fields');
  const fieldNames = fieldsText?.split(',').map((field) => field.trim());
  if (fieldNames?.some((field) => field.length === 0)) {
    throw invalidInput('--fields cannot contain empty names.');
  }
  const expression = readStringOption(options, 'filter');
  const order = readStringOption(options, 'orderBy');
  const filter = isDefined(expression)
    ? parseExportFilter(expression)
    : undefined;
  const orderBy = isDefined(order) ? parseExportOrderBy(order) : undefined;
  const file = await createExportFile({
    path,
    force: readBooleanOption(options, 'force'),
    signal,
  });
  const startedAt = Date.now();
  try {
    const client = createMetadataClient({ target, signal });
    const object = await resolveMetadataObject({
      client,
      name: readStringArgument(commandArguments, 0) ?? '',
    });
    const fields = await fetchExportFields({
      client,
      objectMetadataId: object.id,
    });
    const names = isDefined(fieldNames)
      ? [...new Set(fieldNames)]
      : fields
          .filter((field) => field.isActive && !field.isSystem)
          .map((field) => field.name)
          .sort();
    if (names.length === 0 || names.length > 500) {
      throw invalidInput(
        'Select between 1 and 500 active fields with --fields.',
      );
    }
    const fieldMetadataIds = names.map((name) => {
      const field = fields.find(
        (field) => field.name === name && field.isActive,
      );
      if (!isDefined(field)) {
        throw invalidInput(
          `No active field named ${name} on ${object.namePlural}. Use twenty metadata field list ${object.namePlural}.`,
        );
      }
      return field.id;
    });
    await output.event(
      'start',
      {
        object: object.namePlural,
        outputPath: file.outputPath,
        target: toPublicTarget(target),
      },
      signal,
    );
    if (outputMode === 'human') {
      output.progress({
        message: `Target: ${target.remoteName ?? target.source} (${target.apiUrl})`,
      });
      output.progress({
        message: `Exporting ${object.namePlural}…`,
        percentage: 0,
      });
    }
    let result: { id: string; bytes: number } | undefined;
    let exportId: string | undefined;
    let lastProgress = -1;
    await subscribeGraphql({
      target,
      signal,
      interruptionHint:
        'Run the export again. Interrupted exports cannot be resumed.',
      query: `subscription ExportRecords($input: CreateRecordExportInput!) {
        exportRecords(input: $input) { id filename progress downloadPath errorMessage }
      }`,
      variables: {
        input: {
          objectMetadataId: object.id,
          fieldMetadataIds,
          filter,
          orderBy,
        },
      },
      onConnected: async () => undefined,
      onData: async (data) => {
        if (!isPlainObject(data) || !isPlainObject(data.exportRecords)) {
          throw invalidExport();
        }
        const update = data.exportRecords;
        if (
          !isString(update.id) ||
          !isValidUuid(update.id) ||
          !Number.isInteger(update.progress) ||
          typeof update.progress !== 'number' ||
          update.progress < 0 ||
          update.progress > 100 ||
          (isDefined(exportId) && update.id !== exportId) ||
          (isDefined(update.errorMessage) && !isString(update.errorMessage)) ||
          (isDefined(update.downloadPath) && !isString(update.downloadPath))
        ) {
          throw invalidExport();
        }
        exportId = update.id;
        if (isString(update.errorMessage)) {
          throw new CliError({
            code: 'EXPORT_FAILED',
            message: update.errorMessage,
            hint: 'Run the export again after resolving the server error.',
          });
        }
        if (update.progress !== lastProgress) {
          await output.event(
            'progress',
            { id: update.id, progress: update.progress },
            signal,
          );
          if (outputMode === 'human') {
            output.progress({
              message: `Exporting ${object.namePlural}…`,
              percentage: update.progress,
            });
          }
          lastProgress = update.progress;
        }
        if (isString(update.downloadPath)) {
          if (update.progress !== 100) {
            throw invalidExport();
          }
          if (outputMode === 'human') {
            output.progress({ message: 'Downloading CSV…' });
          }
          const bytes = await downloadRecordExport({
            id: update.id,
            downloadPath: update.downloadPath,
            target,
            signal,
            save: file.save,
          });
          result = { id: update.id, bytes };
          return false;
        }
      },
    });
    if (!isDefined(result)) {
      throw new CliError({
        code: 'EXPORT_INTERRUPTED',
        message: 'The export ended before a download was ready.',
        hint: 'Run the export again.',
      });
    }
    const durationMilliseconds = Date.now() - startedAt;
    return {
      data: {
        ...result,
        object: object.namePlural,
        outputPath: file.outputPath,
        durationMilliseconds,
      },
      human: formatSuccessLine(
        `Exported ${object.namePlural} to ${path} (${result.bytes.toLocaleString('en-US')} bytes) in ${(durationMilliseconds / 1000).toFixed(1)}s`,
      ),
    };
  } finally {
    await file.cleanup();
  }
};
