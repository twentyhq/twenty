import { type AppFunctionExecution } from '@/app/exec/execute-app-function';
import { formatDataValue } from '@/data/format-data-value';

const formatExecutionValue = (value: unknown) =>
  JSON.stringify(value, null, 2).replace(
    /[\x7f-\x9f]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );

export const formatFunctionExecution = (result: AppFunctionExecution) =>
  [
    `Function: ${formatDataValue(result.functionName)}`,
    `Status: ${formatDataValue(result.status)}`,
    `Duration: ${result.durationMilliseconds}ms`,
    ...(result.data !== null
      ? ['Data:', formatExecutionValue(result.data)]
      : []),
    ...(result.error !== null
      ? ['Error:', formatExecutionValue(result.error)]
      : []),
    ...(result.logs.length > 0
      ? ['Logs:', ...result.logs.split('\n').map(formatDataValue)]
      : []),
  ].join('\n');
