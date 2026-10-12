import { type OutputMode } from '@/output/types/output-mode.type';

const FORMAT_FLAG = '--format';

const findLastFormatValue = (args: string[]) =>
  args.reduce<string | undefined>((formatValue, argument, argumentIndex) => {
    if (argument.startsWith(`${FORMAT_FLAG}=`)) {
      return argument.slice(FORMAT_FLAG.length + 1);
    }

    if (argument === FORMAT_FLAG) {
      return args[argumentIndex + 1];
    }

    return formatValue;
  }, undefined);

export const detectOutputMode = (args: string[]): OutputMode => {
  const endOfOptionsIndex = args.indexOf('--');
  const optionArguments =
    endOfOptionsIndex === -1 ? args : args.slice(0, endOfOptionsIndex);
  const formatValue = findLastFormatValue(optionArguments);

  if (optionArguments.includes('--json') || formatValue === 'json') {
    return 'json';
  }

  if (formatValue === 'ndjson') {
    return 'ndjson';
  }

  return 'human';
};
