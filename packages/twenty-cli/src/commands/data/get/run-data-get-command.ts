import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataCell, formatDataDetail } from '@/data/format-data-value';
import { parseDataRecord } from '@/data/parse-data-response';
import { resolveMetadataObject } from '@/metadata/resolve-metadata-object';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatDetails } from '@/output/format-details';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';
import { createRestClient } from '@/transport/rest/create-rest-client';

export const runDataGetCommand: CommandRun<TargetCommandContext> = async ({
  arguments: commandArguments,
  target,
  signal,
  outputMode,
}) => {
  const id = readStringArgument(commandArguments, 1) ?? '';

  if (id.length === 0 || id === '.' || id === '..') {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: 'A record id is required.',
    });
  }

  const object = await resolveMetadataObject({
    client: createMetadataClient({ target, signal }),
    name: readStringArgument(commandArguments, 0) ?? '',
  });
  const record = parseDataRecord(
    await createRestClient({ target, signal }).get(
      `/rest/${encodeURIComponent(object.namePlural)}/${encodeURIComponent(id)}`,
      { query: { depth: 1 } },
    ),
    object.nameSingular,
  );

  return {
    data: record,
    ...(outputMode === 'human'
      ? {
          human: formatDetails(
            Object.entries(record).map(([name, value]) => [
              formatDataCell(name),
              formatDataDetail(value),
            ]),
          ),
        }
      : {}),
  };
};
