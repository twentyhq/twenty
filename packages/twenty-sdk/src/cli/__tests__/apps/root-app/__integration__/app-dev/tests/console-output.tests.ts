import { type RunCliCommandResult } from '../../../../../integration/utils/run-cli-command.util';
import { sanitizeOutput } from '../../../../../integration/utils/sanitize-output.util';

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should match expected output', () => {
      const result = getResult();

      expect(sanitizeOutput(result.output)).toMatchSnapshot();
    });
  });
};
