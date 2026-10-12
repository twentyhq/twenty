import { INPUT_SOURCE_MARKER } from '@/input/constants/input-source-marker.constant';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const assertSingleStandardInputReader = (
  optionValues: Record<string, string | undefined>,
) => {
  const standardInputOptions = Object.entries(optionValues)
    .filter(([, value]) => value === INPUT_SOURCE_MARKER.STANDARD_INPUT)
    .map(([optionName]) => optionName);

  if (standardInputOptions.length > 1) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: `Only one option can read standard input, but ${standardInputOptions.join(' and ')} both use -.`,
      hint: 'Pass the other one inline or as @file.',
    });
  }
};
