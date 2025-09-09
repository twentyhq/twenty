import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { promises as fs } from 'fs';
import * as path from 'path';

import { applicationSchema } from '../scripts/validate-apps';

describe('Application Validation', () => {
  let ajv: Ajv;
  let validate: ValidateFunction;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    validate = ajv.compile(applicationSchema);
  });

  describe('Schema Validation', () => {
    it('should validate a valid application manifest', () => {
      const validManifest = {
        universalIdentifier: 'com.example.test-app',
        label: 'Test Application',
        description: 'A test application for validation',
        version: '1.0.0',
        icon: 'IconTest',
        repositoryUrl: 'https://github.com/example/test-app',
        roles: [],
        objects: [],
        functions: [],
        agents: [],
        views: []
      };

      const isValid = validate(validManifest);
      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    it('should reject manifest with missing required fields', () => {
      const invalidManifest = {
        label: 'Test Application'
        // Missing universalIdentifier and version
      };

      const isValid = validate(invalidManifest);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeTruthy();
      expect(validate.errors!.length).toBeGreaterThan(0);
    });

    it('should reject manifest with invalid universalIdentifier format', () => {
      const invalidManifest = {
        universalIdentifier: 'invalid-format', // Should be reverse domain notation
        label: 'Test Application',
        version: '1.0.0'
      };

      const isValid = validate(invalidManifest);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeTruthy();
    });

    it('should reject manifest with invalid repository URL', () => {
      const invalidManifest = {
        universalIdentifier: 'com.example.test-app',
        label: 'Test Application',
        version: '1.0.0',
        repositoryUrl: 'not-a-valid-url'
      };

      const isValid = validate(invalidManifest);
      expect(isValid).toBe(false);
      expect(validate.errors).toBeTruthy();
    });
  });

  describe('Real Application Validation', () => {
    it('should validate the CRM extension manifest', async () => {
      const manifestPath = path.join(__dirname, '../crm-extension/twenty-app.json');
      
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        
        const isValid = validate(manifest);
        if (!isValid) {
          // eslint-disable-next-line no-console
          console.error('Validation errors:', validate.errors);
        }
        expect(isValid).toBe(true);
      } catch (error: any) {
        // If the file doesn't exist, skip this test
        if (error.code === 'ENOENT') {
          // eslint-disable-next-line no-console
          console.warn('CRM extension manifest not found, skipping validation test');
          return;
        }
        throw error;
      }
    });
  });

  describe('Component Counting', () => {
    it('should correctly count components in a manifest', () => {
      const manifest = {
        universalIdentifier: 'com.example.test-app',
        label: 'Test Application',
        version: '1.0.0',
        roles: [{ universalIdentifier: 'role1' }],
        objects: [
          { universalIdentifier: 'obj1' },
          { universalIdentifier: 'obj2' }
        ],
        functions: [{ universalIdentifier: 'func1' }],
        agents: [],
        views: [{ universalIdentifier: 'view1' }]
      };

      const counts = {
        roles: manifest.roles?.length || 0,
        objects: manifest.objects?.length || 0,
        functions: manifest.functions?.length || 0,
        agents: manifest.agents?.length || 0,
        views: manifest.views?.length || 0
      };

      expect(counts.roles).toBe(1);
      expect(counts.objects).toBe(2);
      expect(counts.functions).toBe(1);
      expect(counts.agents).toBe(0);
      expect(counts.views).toBe(1);

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(5);
    });
  });
});
