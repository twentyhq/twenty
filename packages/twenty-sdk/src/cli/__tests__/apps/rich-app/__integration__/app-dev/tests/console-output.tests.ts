import { getOutputByPrefix } from '@/cli/__tests__/integration/utils/get-output-by-prefix.util';
import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should match init output snapshot', () => {
      const result = getResult();
      const initOutput = getOutputByPrefix(result.output, 'init');

      expect(initOutput).toMatchSnapshot();
    });

    it('should match manifest-watch output snapshot', () => {
      const result = getResult();
      const manifestOutput = getOutputByPrefix(result.output, 'manifest-watch');

      expect(manifestOutput).toMatchSnapshot();
    });

    it('should match functions-watch output snapshot', () => {
      const result = getResult();
      const functionsOutput = getOutputByPrefix(result.output, 'functions-watch');

      expect(functionsOutput).toMatchSnapshot();
    });

    it('should match front-components-watch output snapshot', () => {
      const result = getResult();
      const frontComponentsOutput = getOutputByPrefix(result.output, 'front-components-watch');

      expect(frontComponentsOutput).toMatchSnapshot();
    });
  });
};
