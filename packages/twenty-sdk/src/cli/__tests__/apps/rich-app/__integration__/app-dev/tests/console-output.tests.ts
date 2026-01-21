import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';

const sanitizeOutput = (output: string): string => {
  return output
    // Remove ANSI color codes
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    // Normalize file paths (replace absolute paths with relative)
    .replace(/\/[^\s]+\/rich-app/g, '<APP_PATH>')
    // Normalize timestamps if any
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '<TIMESTAMP>')
    // Normalize durations
    .replace(/\d+ms/g, '<DURATION>')
    // Trim trailing whitespace from each line
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
};

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should match expected output', () => {
      const result = getResult();
      const sanitizedOutput = sanitizeOutput(result.output);

      expect(sanitizedOutput).toMatchSnapshot();
    });
  });
};
