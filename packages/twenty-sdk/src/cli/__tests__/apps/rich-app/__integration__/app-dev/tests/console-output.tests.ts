import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should contain key messages', () => {
      const result = getResult();
      const output = result.output;

      expect(output).toContain('Starting Twenty Application Development Mode');
      expect(output).toContain('Building manifest');
      expect(output).toContain('Loaded "Hello World"');
      expect(output).toContain('Found 2 object(s)');
      expect(output).toContain('Found 4 function(s)');
      expect(output).toContain('Found 4 front component(s)');
      expect(output).toContain('Found 2 role(s)');
      expect(output).toContain('Manifest written to');
      expect(output).toContain('Functions built');
      expect(output).toContain('Front components built');
    });
  });
};
