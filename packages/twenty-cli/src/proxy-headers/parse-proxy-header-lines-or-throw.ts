import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { validateProxyHeaderOrThrow } from '@/proxy-headers/validate-proxy-header-or-throw';

export const parseProxyHeaderLinesOrThrow = ({
  lines,
  sourceName,
}: {
  lines: string[];
  sourceName: string;
}): Record<string, string> => {
  const headers: Record<string, string> = {};

  for (const line of lines) {
    if (line.trim() === '') {
      continue;
    }

    const separatorIndex = line.indexOf(':');

    if (separatorIndex <= 0) {
      throw new CliError({
        code: 'INVALID_INPUT',
        exitCode: EXIT_CODE.USAGE,
        message: `${sourceName} has a proxy header without a "Name: value" separator.`,
        hint: 'Write each header as "Name: value", for example "cf-access-token: <token>".',
      });
    }

    const [name, value] = validateProxyHeaderOrThrow({
      name: line.slice(0, separatorIndex),
      value: line.slice(separatorIndex + 1),
      sourceName,
    });

    headers[name] = value;
  }

  return headers;
};
