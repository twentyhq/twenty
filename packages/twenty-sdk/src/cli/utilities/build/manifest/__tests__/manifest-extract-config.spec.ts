import { extractDefineEntity } from '@/cli/utilities/build/manifest/manifest-extract-config';

describe('extractDefineEntity', () => {
  it('should detect defineApplication in default export', () => {
    const fileContent = `
      import { defineApplication } from 'twenty-sdk/define';
      export default defineApplication({ name: 'MyApp' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBe('defineApplication');
  });

  it('should detect defineField in default export', () => {
    const fileContent = `
      import { defineField } from 'twenty-sdk/define';
      export default defineField({ name: 'myField' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBe('defineField');
  });

  it('should detect defineLogicFunction in default export', () => {
    const fileContent = `
      import { defineLogicFunction } from 'twenty-sdk/define';
      export default defineLogicFunction({ name: 'myFunction' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBe('defineLogicFunction');
  });

  it('should detect defineObject in default export', () => {
    const fileContent = `
      import { defineObject } from 'twenty-sdk/define';
      export default defineObject({ name: 'myObject' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBe('defineObject');
  });

  it('should detect defineRole in default export', () => {
    const fileContent = `
      import { defineRole } from 'twenty-sdk/define';
      export default defineRole({ name: 'myRole' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBe('defineRole');
  });

  it('should detect defineFrontComponent in default export', () => {
    const fileContent = `
      import { defineFrontComponent } from 'twenty-sdk/define';
      export default defineFrontComponent({ name: 'myComponent' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBe('defineFrontComponent');
  });

  it('should not detect non-target function in default export', () => {
    const fileContent = `
      import { someOtherFunction } from 'twenty-sdk/define';
      export default someOtherFunction({ name: 'myFunction' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBeUndefined();
  });

  it('should handle files without default export', () => {
    const fileContent = `
      import { defineApplication } from 'twenty-sdk/define';
      const app = defineApplication({ name: 'MyApp' });
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBeUndefined();
  });

  it('should handle files with non-call default export', () => {
    const fileContent = `
      import { defineApplication } from 'twenty-sdk/define';
      export default { name: 'MyApp' };
    `;
    const result = extractDefineEntity(fileContent);
    expect(result).toBeUndefined();
  });
});
