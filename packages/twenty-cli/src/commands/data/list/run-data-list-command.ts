import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { assertDataResultLimit } from '@/data/assert-data-result-limit';
import { formatDataPage } from '@/data/format-data-page';
import { iterateDataPages } from '@/data/iterate-data-pages';
import { parseDataPage } from '@/data/parse-data-response';
import { readDataListOptions } from '@/data/read-data-list-options';
import {
  type DataPageInfo,
  type DataRecord,
} from '@/data/types/data-page.type';
import { resolveMetadataObject } from '@/metadata/resolve-metadata-object';
import { CliError } from '@/output/cli-error';
import { toCliError } from '@/output/to-cli-error';
import { toPublicTarget } from '@/target/to-public-target';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';
import { createRestClient } from '@/transport/rest/create-rest-client';

export const runDataListCommand: CommandRun<TargetCommandContext> = async ({
  arguments: commandArguments,
  options,
  target,
  signal,
  output,
  outputMode,
}) => {
  const listOptions = readDataListOptions(options);
  const object = await resolveMetadataObject({
    client: createMetadataClient({ target, signal }),
    name: readStringArgument(commandArguments, 0) ?? '',
  });
  const client = createRestClient({ target, signal });
  const isStreaming = outputMode === 'ndjson';
  const records: DataRecord[] = [];
  let recordCount = 0;
  let pages = 0;
  let recordBytes = 0;
  let resumeCursor = listOptions.cursor ?? null;
  let pageInfo: DataPageInfo = {
    hasNextPage: false,
    startCursor: null,
    endCursor: null,
  };
  let totalCount = 0;

  try {
    if (isStreaming) {
      await output.event(
        'start',
        { object: object.namePlural, target: toPublicTarget(target) },
        signal,
      );
    }

    for await (const page of iterateDataPages({
      cursor: listOptions.cursor,
      signal,
      fetchPage: async (cursor) =>
        parseDataPage(
          await client.get(`/rest/${encodeURIComponent(object.namePlural)}`, {
            query: {
              limit: listOptions.limit,
              starting_after: cursor,
              filter: listOptions.filter,
              order_by: listOptions.orderBy,
            },
          }),
          object.namePlural,
          listOptions.limit,
        ),
    })) {
      for (const record of page.records) {
        if (isStreaming) {
          await output.event('record', record, signal);
        } else {
          recordBytes += Buffer.byteLength(JSON.stringify(record), 'utf8');
          assertDataResultLimit({
            recordCount: recordCount + 1,
            bytes:
              recordBytes +
              recordCount +
              Buffer.byteLength(
                JSON.stringify({
                  records: [],
                  pageInfo: page.pageInfo,
                  totalCount: page.totalCount,
                }),
                'utf8',
              ),
          });
          records.push(record);
        }

        recordCount += 1;
      }

      pages += 1;
      pageInfo = page.pageInfo;
      totalCount = page.totalCount;
      resumeCursor = pageInfo.endCursor ?? resumeCursor;

      if (isStreaming) {
        await output.event(
          'progress',
          { recordCount, pages, resumeCursor, pageInfo, totalCount },
          signal,
        );
      }

      if (!listOptions.all) {
        break;
      }
    }
  } catch (error) {
    const failure = toCliError(error, signal);

    if (!isStreaming) {
      throw failure;
    }

    throw new CliError({
      code: failure.code,
      exitCode: failure.exitCode,
      message: failure.message,
      hint: failure.hint,
      details: { ...failure.details, recordCount, pages, resumeCursor },
    });
  }

  if (isStreaming) {
    return { data: { recordCount, pages, resumeCursor, pageInfo, totalCount } };
  }

  const page = { records, pageInfo, totalCount };
  const absentFields =
    outputMode === 'human' && records.length > 0
      ? (listOptions.fields ?? []).filter(
          (field) => !records.some((record) => Object.hasOwn(record, field)),
        )
      : [];

  if (absentFields.length > 0) {
    output.warn({
      code: 'FIELDS_NOT_RETURNED',
      message: `No returned record has ${absentFields.join(', ')}; see twenty metadata field list ${object.namePlural}.`,
    });
  }

  return {
    data: page,
    ...(outputMode === 'human'
      ? {
          human: formatDataPage({
            page,
            options: listOptions,
          }),
        }
      : {}),
  };
};
