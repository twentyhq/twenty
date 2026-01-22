import { type RunCliCommandResult } from '../../../../../integration/utils/run-cli-command.util';

export const defineConsoleOutputTests = (
  getResult: () => RunCliCommandResult,
): void => {
  describe('console output', () => {
    it('should contain init messages', () => {
      const result = getResult();
      const output = result.output;

      expect(output).toContain('[init] 🚀 Starting Twenty Application Development Mode');
    });

    it('should contain manifest-build messages', () => {
      const result = getResult();
      const output = result.output;

      expect(output).toContain('[manifest-build] 🔄 Building...');
      expect(output).toContain('[manifest-build] ✓ Loaded "Root App"');
      expect(output).toContain('[manifest-build] ✓ Found 1 object(s)');
      expect(output).toContain('[manifest-build] ✓ Found 1 function(s)');
      expect(output).toContain('[manifest-build] ✓ Found 1 front component(s)');
      expect(output).toContain('[manifest-build] ✓ Found 1 role(s)');
      expect(output).toContain('[manifest-build] ✓ Written to');
    });

    it('should contain manifest-watch messages', () => {
      const result = getResult();
      const output = result.output;

      expect(output).toContain('[manifest-watch] 📂 Watcher started');
    });

    it('should contain functions-watch messages', () => {
      const result = getResult();
      const output = result.output;

      expect(output).toContain('[functions-watch] 📦 Building...');
      expect(output).toContain('[functions-watch] ✓ Built');
    });

    it('should contain front-components-watch messages', () => {
      const result = getResult();
      const output = result.output;

      expect(output).toContain('[front-components-watch] 🎨 Building...');
      expect(output).toContain('[front-components-watch] ✓ Built');
    });
  });
};
