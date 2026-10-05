import { readInputValue } from '@/input/read-input-value';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

const PIPE_HINT =
  'Pipe it in, for example: printf \'%s\' "$TWENTY_API_KEY" | twenty auth login --with-token --url <url> --name <name>';

export const readApiKeyFromStandardInput = async (signal: AbortSignal) => {
  if (process.stdin.isTTY === true) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: 'The API key must come from standard input.',
      hint: PIPE_HINT,
    });
  }

  const apiKey = (
    await readInputValue({ value: '-', optionName: 'the API key', signal })
  ).trim();

  if (apiKey === '' || /\s/.test(apiKey)) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message:
        apiKey === ''
          ? 'Standard input is empty.'
          : 'Standard input must contain only the API key.',
      hint: PIPE_HINT,
    });
  }

  return apiKey;
};
