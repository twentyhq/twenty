import { type AppFunctionExecution } from '@/app/exec/execute-app-function';
import { formatDataValue } from '@/data/format-data-value';

export const formatFunctionExecution = (result: AppFunctionExecution) =>
  [
    `Function: ${formatDataValue(result.functionName)}`,
    `Status: ${formatDataValue(result.status)}`,
    `Duration: ${result.durationMilliseconds}ms`,
    ...(result.data !== null
      ? ['Data:', JSON.stringify(result.data, null, 2)]
      : []),
    ...(result.error !== null
      ? ['Error:', JSON.stringify(result.error, null, 2)]
      : []),
    ...(result.logs.length > 0
      ? ['Logs:', ...result.logs.split('\n').map(formatDataValue)]
      : []),
  ].join('\n');
