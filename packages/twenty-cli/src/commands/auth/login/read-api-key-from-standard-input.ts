import { API_KEY_STDIN_HINT } from '@/commands/auth/login/constants/api-key-stdin-hint.constant';
import { readInputValue } from '@/input/read-input-value';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const readApiKeyFromStandardInput = async (signal: AbortSignal) => {
  if (process.stdin.isTTY === true) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: 'The API key must come from standard input.',
      hint: API_KEY_STDIN_HINT,
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
      hint: API_KEY_STDIN_HINT,
    });
  }

  return apiKey;
};
