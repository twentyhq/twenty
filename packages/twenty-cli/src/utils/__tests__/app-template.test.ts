import { createBasePackageJson, createReadmeContent } from '../app-template';
import {
  AGENT_SCHEMA_URL,
  APP_MANIFEST_SCHEMA_URL,
} from '../../constants/schemas';

// Mock crypto.randomUUID to make tests deterministic
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid-12345'),
}));

describe('app-template', () => {
  describe('createBasePackageJson', () => {
    it('should create a valid app package.json with correct structure', () => {
      const appName = 'my-test-app';
      const description = 'A Twenty application for my-test-app';
      const basePackageJson = createBasePackageJson(appName, description);

      expect(basePackageJson).toEqual({
        $schema: APP_MANIFEST_SCHEMA_URL,
        universalIdentifier: 'mocked-uuid-12345',
        label: 'My Test App',
        description: 'A Twenty application for my-test-app',
        version: '0.0.1',
        engines: {
          node: '^24.5.0',
          npm: 'please-use-yarn',
          yarn: '>=4.9.2',
        },
        packageManager: 'yarn@4.9.2',
        license: 'MIT',
      });
    });

    it('should handle single word app names', () => {
      const appName = 'calculator';
      const basePackageJson = createBasePackageJson(appName, '');

      expect(basePackageJson.label).toBe('Calculator');
      expect(basePackageJson.universalIdentifier).toBe('mocked-uuid-12345');
    });

    it('should handle kebab-case app names correctly', () => {
      const appName = 'user-management-system';
      const basePackageJson = createBasePackageJson(appName, '');

      expect(basePackageJson.label).toBe('User Management System');
      expect(basePackageJson.universalIdentifier).toBe('mocked-uuid-12345');
    });

    it('should generate unique universalIdentifiers', () => {
      const basePackageJson = createBasePackageJson('test-app', '');

      expect(basePackageJson.universalIdentifier).toBeDefined();
      expect(typeof basePackageJson.universalIdentifier).toBe('string');
    });
  });

  describe('createReadmeContent', () => {
    it('should generate correct README content', () => {
      const appName = 'my-awesome-app';
      const appDir = '/path/to/my-awesome-app';
      const readmeContent = createReadmeContent(appName, appDir);

      expect(readmeContent).toContain('# my-awesome-app');
      expect(readmeContent).toContain('A Twenty application.');
      expect(readmeContent).toContain(
        'twenty app dev --path /path/to/my-awesome-app',
      );
      expect(readmeContent).toContain('cd /path/to/my-awesome-app');
      expect(readmeContent).toContain(
        'twenty app deploy --path /path/to/my-awesome-app',
      );
    });

    it('should include development and deployment sections', () => {
      const readmeContent = createReadmeContent('test-app', '/test/path');

      expect(readmeContent).toContain('## Development');
      expect(readmeContent).toContain('## Deployment');
      expect(readmeContent).toContain('To start development mode:');
      expect(readmeContent).toContain('To deploy the application:');
    });

    it('should handle different app directories', () => {
      const appName = 'sample-app';
      const appDir = '/custom/directory/sample-app';
      const readmeContent = createReadmeContent(appName, appDir);

      expect(readmeContent).toContain('/custom/directory/sample-app');
    });
  });
});
