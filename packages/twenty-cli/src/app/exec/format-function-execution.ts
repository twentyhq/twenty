import { type AppFunctionExecution } from '@/app/exec/execute-app-function';
import { formatDataValue } from '@/data/format-data-value';
import { formatDetails } from '@/output/format-details';
import { boldText, colorText, dimText } from '@/output/style';

const formatExecutionValue = (value: unknown) =>
  JSON.stringify(value, null, 2).replace(
    /[\x7f-\x9f]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );

export const formatFunctionExecution = (
  result: AppFunctionExecution,
  stream: NodeJS.WriteStream = process.stdout,
) =>
  [
    formatDetails(
      [
        ['Function', formatDataValue(result.functionName)],
        [
          'Status',
          colorText(
            result.status === 'SUCCESS' ? 'green' : 'red',
            formatDataValue(result.status),
            stream,
          ),
        ],
        ['Duration', dimText(`${result.durationMilliseconds}ms`, stream)],
      ],
      stream,
    ),
    ...(result.data !== null
      ? ['', boldText('Data:', stream), formatExecutionValue(result.data)]
      : []),
    ...(result.error !== null
      ? ['', boldText('Error:', stream), formatExecutionValue(result.error)]
      : []),
    ...(result.logs.length > 0
      ? [
          '',
          boldText('Logs:', stream),
          ...result.logs.split('\n').map(formatDataValue),
        ]
      : []),
  ].join('\n');
