import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';
import { sanitizeAnsi } from '@/cli/__tests__/integration/utils/sanitize-ansi.util';

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should contain init messages', () => {
      const output = sanitizeAnsi(getResult().output);

      expect(output).toContain('Application');
      expect(output).toContain('Name: Loading...');
      expect(output).toContain('Status: o Idle');
    });

    it('should contain dev-mode build messages', () => {
      const output = sanitizeAnsi(getResult().output);

      expect(output).toContain('Building manifest');
      expect(output).toContain('Successfully built manifest');
    });

    it('should contain dev-mode function build messages', () => {
      const output = sanitizeAnsi(getResult().output);

      expect(output).toContain('Successfully built');
    });

    it('should contain dev-mode sync messages', () => {
      const output = sanitizeAnsi(getResult().output);

      expect(output).toContain('✓ Synced');
    });
  });
};
