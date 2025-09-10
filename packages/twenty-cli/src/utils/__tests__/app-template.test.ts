import { createManifest, createReadmeContent } from '../app-template';

// Mock crypto.randomUUID to make tests deterministic
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid-12345'),
}));

describe('app-template', () => {
  describe('createManifest', () => {
    it('should create a valid app manifest with correct structure', () => {
      const appName = 'my-test-app';
      const manifest = createManifest(appName);

      expect(manifest).toEqual({
        standardId: 'mocked-uuid-12345',
        label: 'My Test App',
        description: 'A Twenty application for my-test-app',
        version: '1.0.0',
        agents: [
          {
            standardId: 'mocked-uuid-12345',
            name: 'my-test-appAgent',
            label: 'My Test App Agent',
            description: 'AI agent for my-test-app',
            prompt:
              'You are an AI agent for my-test-app. Help users with their tasks.',
            modelId: 'auto',
            responseFormat: {
              type: 'text',
            },
          },
        ],
      });
    });

    it('should handle single word app names', () => {
      const appName = 'calculator';
      const manifest = createManifest(appName);

      expect(manifest.label).toBe('Calculator');
      expect(manifest.agents[0].name).toBe('calculatorAgent');
      expect(manifest.agents[0].label).toBe('Calculator Agent');
    });

    it('should handle kebab-case app names correctly', () => {
      const appName = 'user-management-system';
      const manifest = createManifest(appName);

      expect(manifest.label).toBe('User Management System');
      expect(manifest.agents[0].name).toBe('user-management-systemAgent');
      expect(manifest.agents[0].label).toBe('User Management System Agent');
    });

    it('should generate unique standardIds for app and agent', () => {
      const manifest = createManifest('test-app');

      expect(manifest.standardId).toBeDefined();
      expect(manifest.agents[0].standardId).toBeDefined();
      expect(typeof manifest.standardId).toBe('string');
      expect(typeof manifest.agents[0].standardId).toBe('string');
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
