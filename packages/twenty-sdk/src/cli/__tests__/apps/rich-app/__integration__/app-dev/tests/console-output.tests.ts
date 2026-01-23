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

    it('should contain manifest-watch messages', () => {
      const output = getOutputByPrefix(getResult().output, 'manifest-watch');

      expect(output).toContain('[manifest-watch] 🔄 Building...');
      expect(output).toContain('[manifest-watch] ✓ Loaded "Hello World"');
      expect(output).toContain('[manifest-watch] ✓ Found 2 object(s)');
      expect(output).toContain('[manifest-watch] ✓ Found 4 function(s)');
      expect(output).toContain('[manifest-watch] ✓ Found 4 front component(s)');
      expect(output).toContain('[manifest-watch] ✓ Found 2 role(s)');
      expect(output).toContain('[manifest-watch] ✓ Written to');
      expect(output).toContain('[manifest-watch] 📂 Watcher started');
    });

    it('should contain functions-watch messages', () => {
      const output = getOutputByPrefix(getResult().output, 'functions-watch');

      expect(output).toContain('[functions-watch] 📦 Building...');
      expect(output).toContain('[functions-watch] ✓ Built');
    });

    it('should contain front-components-watch messages', () => {
      const output = getOutputByPrefix(
        getResult().output,
        'front-components-watch',
      );

      expect(output).toContain('[front-components-watch] 🎨 Building...');
      expect(output).toContain('[front-components-watch] ✓ Built');
    });
  });
};
