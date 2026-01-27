import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';

const sanitizeAnsi = (output: string): string =>
  output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should contain init messages', () => {
      const output = sanitizeAnsi(getResult().output);

      expect(output).toContain(
        '[init] 🚀 Starting Twenty Application Development Mode',
      );
      expect(output).toContain('[init] 📁 App Path:');
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
