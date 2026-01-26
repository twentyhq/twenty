import { getOutputByPrefix } from '@/cli/__tests__/integration/utils/get-output-by-prefix.util';
import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should contain init messages', () => {
      const output = getOutputByPrefix(getResult().output, 'init');

      expect(output).toContain(
        '[init] 🚀 Starting Twenty Application Development Mode',
      );
      expect(output).toContain('[init] 📁 App Path:');
    });

    it('should contain dev-mode build messages', () => {
      const output = getOutputByPrefix(getResult().output, 'dev-mode');

      expect(output).toContain('[dev-mode] Building manifest...');
      expect(output).toContain('[dev-mode] Successfully built manifest');
    });

    it('should contain dev-mode function build messages', () => {
      const output = getOutputByPrefix(getResult().output, 'dev-mode');

      expect(output).toContain('[dev-mode] ✓ Successfully built');
    });

    it('should contain dev-mode sync messages', () => {
      const output = getOutputByPrefix(getResult().output, 'dev-mode');

      expect(output).toContain('[dev-mode] ✓ Synced');
    });
  });
};
