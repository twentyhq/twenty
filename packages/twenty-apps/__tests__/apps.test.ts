import { promises as fs } from 'fs';
import * as path from 'path';

describe('Twenty Apps Package', () => {
  describe('Package Structure', () => {
    it('should have a hello-world app with manifest', async () => {
      const manifestPath = path.join(__dirname, '../hello-world/twenty-app.json');
      const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);
      
      expect(manifestExists).toBe(true);
    });

    it('should have a template app with manifest', async () => {
      const templatePath = path.join(__dirname, '../_template/twenty-app.json');
      const templateExists = await fs.access(templatePath).then(() => true).catch(() => false);
      
      expect(templateExists).toBe(true);
    });
  });

  describe('App Manifests', () => {
    it('should have valid JSON in hello-world manifest', async () => {
      const manifestPath = path.join(__dirname, '../hello-world/twenty-app.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      
      expect(() => JSON.parse(manifestContent)).not.toThrow();
      
      const manifest = JSON.parse(manifestContent);
      expect(manifest).toHaveProperty('standardId');
      expect(manifest).toHaveProperty('label');
      expect(manifest).toHaveProperty('version');
    });

    it('should have valid JSON in template manifest', async () => {
      const templatePath = path.join(__dirname, '../_template/twenty-app.json');
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      expect(() => JSON.parse(templateContent)).not.toThrow();
      
      const template = JSON.parse(templateContent);
      expect(template).toHaveProperty('standardId');
      expect(template).toHaveProperty('label');
      expect(template).toHaveProperty('version');
    });
  });

  describe('Package Configuration', () => {
    it('should have a valid package.json', async () => {
      const packagePath = path.join(__dirname, '../package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      
      expect(() => JSON.parse(packageContent)).not.toThrow();
      
      const packageJson = JSON.parse(packageContent);
      expect(packageJson.name).toBe('twenty-apps');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('description');
    });
  });
});
