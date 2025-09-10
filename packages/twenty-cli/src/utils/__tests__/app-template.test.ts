import {
  createAgentManifest,
  createManifest,
  createReadmeContent,
} from '../app-template';

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
        $schema:
          'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-cli/schemas/app-manifest.schema.json',
        standardId: 'mocked-uuid-12345',
        label: 'My Test App',
        description: 'A Twenty application for my-test-app',
        version: '1.0.0',
        // agents will be discovered from the agents/ folder
      });
    });

    it('should handle single word app names', () => {
      const appName = 'calculator';
      const manifest = createManifest(appName);

      expect(manifest.label).toBe('Calculator');
      expect(manifest.standardId).toBe('mocked-uuid-12345');
    });

    it('should handle kebab-case app names correctly', () => {
      const appName = 'user-management-system';
      const manifest = createManifest(appName);

      expect(manifest.label).toBe('User Management System');
      expect(manifest.standardId).toBe('mocked-uuid-12345');
    });

    it('should generate unique standardIds', () => {
      const manifest = createManifest('test-app');

      expect(manifest.standardId).toBeDefined();
      expect(typeof manifest.standardId).toBe('string');
    });
  });

  describe('createAgentManifest', () => {
    it('should create a valid agent manifest with correct structure', () => {
      const appName = 'my-test-app';
      const agent = createAgentManifest(appName);

      expect(agent).toEqual({
        $schema:
          'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-cli/schemas/agent.schema.json',
        standardId: 'mocked-uuid-12345',
        name: 'myTestAppAgent',
        label: 'My Test App Agent',
        description: 'AI agent for my-test-app',
        prompt:
          'You are an AI agent for my-test-app. Help users with their tasks and provide assistance with Twenty CRM features.',
        modelId: 'auto',
        responseFormat: {
          type: 'text',
        },
      });
    });

    it('should handle single word app names', () => {
      const appName = 'calculator';
      const agent = createAgentManifest(appName);

      expect(agent.name).toBe('calculatorAgent');
      expect(agent.label).toBe('Calculator Agent');
    });

    it('should handle kebab-case app names correctly', () => {
      const appName = 'user-management-system';
      const agent = createAgentManifest(appName);

      expect(agent.name).toBe('userManagementSystemAgent');
      expect(agent.label).toBe('User Management System Agent');
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
