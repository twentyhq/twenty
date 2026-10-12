import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { subscribeGraphql } from '@/transport/graphql/subscribe-graphql';

export type AppLogRecord = {
  applicationUniversalIdentifier: string;
  functionName: string | null;
  functionUniversalIdentifier: string | null;
  logs: string;
};

const isUnsupportedIdentityQuery = (error: unknown) => {
  if (!(error instanceof CliError) || error.code !== 'GRAPHQL_ERROR') {
    return false;
  }
  const errors = error.details?.errors;

  return (
    isArray(errors) &&
    errors.length > 0 &&
    errors.every(
      (entry: unknown) =>
        isPlainObject(entry) &&
        (!isDefined(entry.code) ||
          entry.code === 'GRAPHQL_VALIDATION_FAILED') &&
        isString(entry.message) &&
        /Cannot query field "(?:name|universalIdentifier)" on type "LogicFunctionLogs"/.test(
          entry.message,
        ),
    )
  );
};

export const subscribeToAppLogs = async ({
  applicationUniversalIdentifier,
  filter,
  target,
  signal,
  onConnected,
  onIdentityUnavailable,
  onRecord,
}: {
  applicationUniversalIdentifier: string;
  filter: { name?: string; universalIdentifier?: string };
  target: ResolvedTarget;
  signal: AbortSignal;
  onConnected: () => Promise<void>;
  onIdentityUnavailable: () => Promise<void>;
  onRecord: (record: AppLogRecord) => Promise<void>;
}) => {
  let receivedRecords = 0;
  const subscribe = (includeIdentity: boolean) =>
    subscribeGraphql({
      target,
      signal,
      query: `subscription SubscribeToLogs($input: LogicFunctionLogsInput!) {
        logicFunctionLogs(input: $input) {
          logs
          ${includeIdentity ? 'name universalIdentifier' : ''}
        }
      }`,
      variables: { input: { applicationUniversalIdentifier, ...filter } },
      onConnected,
      onData: async (data) => {
        const record = isPlainObject(data) ? data.logicFunctionLogs : undefined;
        if (
          !isPlainObject(record) ||
          !isString(record.logs) ||
          (isDefined(record.name) && !isString(record.name)) ||
          (isDefined(record.universalIdentifier) &&
            !isString(record.universalIdentifier))
        ) {
          throw new CliError({
            code: 'INVALID_RESPONSE',
            message: 'The server returned an invalid application log record.',
          });
        }
        receivedRecords += 1;
        await onRecord({
          applicationUniversalIdentifier,
          functionName: record.name ?? filter.name ?? null,
          functionUniversalIdentifier:
            record.universalIdentifier ?? filter.universalIdentifier ?? null,
          logs: record.logs,
        });
      },
    });

  try {
    await subscribe(true);
  } catch (error) {
    if (
      signal.aborted ||
      receivedRecords > 0 ||
      !isUnsupportedIdentityQuery(error)
    ) {
      throw error;
    }
    await onIdentityUnavailable();
    await subscribe(false);
  }
};
