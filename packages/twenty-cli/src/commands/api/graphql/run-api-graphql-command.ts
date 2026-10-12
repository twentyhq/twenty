import { isDefined } from 'twenty-shared/utils';

import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatBody } from '@/commands/api/format-body';
import { assertSingleStandardInputReader } from '@/input/assert-single-standard-input-reader';
import { parseJsonObjectInput } from '@/input/parse-json-input';
import { readInputValue } from '@/input/read-input-value';
import { sendGraphqlRequest } from '@/transport/graphql/send-graphql-request';

const readVariables = async (
  variablesOption: string | undefined,
  signal: AbortSignal,
) => {
  if (!isDefined(variablesOption)) {
    return undefined;
  }

  return parseJsonObjectInput({
    text: await readInputValue({
      value: variablesOption,
      optionName: '--variables',
      signal,
    }),
    optionName: '--variables',
  });
};

export const runApiGraphqlCommand: CommandRun<TargetCommandContext> = async ({
  options,
  target,
  signal,
}) => {
  const queryOption = readStringOption(options, 'query') ?? '';
  const variablesOption = readStringOption(options, 'variables');

  assertSingleStandardInputReader({
    '--query': queryOption,
    '--variables': variablesOption,
  });

  const query = await readInputValue({
    value: queryOption,
    optionName: '--query',
    signal,
  });
  const variables = await readVariables(variablesOption, signal);
  const data = await sendGraphqlRequest({
    target,
    signal,
    endpoint: readBooleanOption(options, 'metadata') ? 'metadata' : 'core',
    query,
    variables,
  });

  return { data, human: formatBody(data) };
};
