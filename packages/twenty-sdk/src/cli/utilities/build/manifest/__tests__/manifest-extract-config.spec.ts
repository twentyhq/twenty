import {
  extractDefineEntity,
  findReferencedTargetFunctions,
} from '@/cli/utilities/build/manifest/manifest-extract-config';

// Valid TSX front component whose content breaks when parsed as plain TS:
// the backtick in JSX text opens a template literal that swallows the rest
// of the file, including the export default, so the entity used to be
// silently dropped from the manifest.
const DEEPLY_NESTED_JSX_FRONT_COMPONENT = `
import { defineFrontComponent } from 'twenty-sdk/define';

type Item = { id: string; label: string; state: string };

const Component = ({ items, mode }: { items: Item[]; mode: string }) => {
  return (
    <div>
      <p>Press \` to toggle the console</p>
      {mode === 'expanded' ? (
        items.map((item) => {
          const isActive = item.state === 'active';
          return (
            <div
              key={item.id}
              data-state={isActive ? 'on' : 'off'}
              aria-label={isActive ? (item.label ? item.label : 'none') : undefined}
            >
              {isActive ? (
                item.label ? (
                  <strong>{item.label}</strong>
                ) : (
                  <em>missing</em>
                )
              ) : (
                <span>{item.id}</span>
              )}
            </div>
          );
        })
      ) : (
        <p>collapsed</p>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'a7c1b9a0-0000-0000-0000-000000000000',
  name: 'deeply-nested',
  component: Component,
});
`;

describe('extractDefineEntity', () => {
  it('should detect defineApplication in default export', () => {
    const fileContent = `
      import { defineApplication } from 'twenty-sdk/define';
      export default defineApplication({ name: 'MyApp' });
    `;
    const result = extractDefineEntity(fileContent, 'application.config.ts');
    expect(result).toBe('defineApplication');
  });

  it('should detect defineField in default export', () => {
    const fileContent = `
      import { defineField } from 'twenty-sdk/define';
      export default defineField({ name: 'myField' });
    `;
    const result = extractDefineEntity(fileContent, 'my.field.ts');
    expect(result).toBe('defineField');
  });

  it('should detect defineLogicFunction in default export', () => {
    const fileContent = `
      import { defineLogicFunction } from 'twenty-sdk/define';
      export default defineLogicFunction({ name: 'myFunction' });
    `;
    const result = extractDefineEntity(fileContent, 'my.function.ts');
    expect(result).toBe('defineLogicFunction');
  });

  it('should detect defineObject in default export', () => {
    const fileContent = `
      import { defineObject } from 'twenty-sdk/define';
      export default defineObject({ name: 'myObject' });
    `;
    const result = extractDefineEntity(fileContent, 'my.object.ts');
    expect(result).toBe('defineObject');
  });

  it('should detect defineRole in default export', () => {
    const fileContent = `
      import { defineRole } from 'twenty-sdk/define';
      export default defineRole({ name: 'myRole' });
    `;
    const result = extractDefineEntity(fileContent, 'my.role.ts');
    expect(result).toBe('defineRole');
  });

  it('should detect defineApplicationRole in default export', () => {
    const fileContent = `
      import { defineApplicationRole } from 'twenty-sdk/define';
      export default defineApplicationRole({ universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061', label: 'Default function role' });
    `;
    const result = extractDefineEntity(fileContent, 'my.role.ts');
    expect(result).toBe('defineApplicationRole');
  });

  it('should detect defineFrontComponent in default export', () => {
    const fileContent = `
      import { defineFrontComponent } from 'twenty-sdk/define';
      export default defineFrontComponent({ name: 'myComponent' });
    `;
    const result = extractDefineEntity(fileContent, 'my.front-component.tsx');
    expect(result).toBe('defineFrontComponent');
  });

  it('should detect defineFrontComponent in a .tsx file with JSX that breaks TS-mode parsing', () => {
    const result = extractDefineEntity(
      DEEPLY_NESTED_JSX_FRONT_COMPONENT,
      'deeply-nested.front-component.tsx',
    );
    expect(result).toBe('defineFrontComponent');
  });

  it('should not detect non-target function in default export', () => {
    const fileContent = `
      import { someOtherFunction } from 'twenty-sdk/define';
      export default someOtherFunction({ name: 'myFunction' });
    `;
    const result = extractDefineEntity(fileContent, 'my.function.ts');
    expect(result).toBeUndefined();
  });

  it('should handle files without default export', () => {
    const fileContent = `
      import { defineApplication } from 'twenty-sdk/define';
      const app = defineApplication({ name: 'MyApp' });
    `;
    const result = extractDefineEntity(fileContent, 'application.config.ts');
    expect(result).toBeUndefined();
  });

  it('should handle files with non-call default export', () => {
    const fileContent = `
      import { defineApplication } from 'twenty-sdk/define';
      export default { name: 'MyApp' };
    `;
    const result = extractDefineEntity(fileContent, 'application.config.ts');
    expect(result).toBeUndefined();
  });
});

describe('findReferencedTargetFunctions', () => {
  it('should find define calls in files where no entity is discoverable', () => {
    const fileContent = `
      import { defineFrontComponent } from 'twenty-sdk/define';
      const component = defineFrontComponent({ name: 'myComponent' });
      export { component };
    `;
    expect(findReferencedTargetFunctions(fileContent)).toEqual([
      'defineFrontComponent',
    ]);
  });

  it('should not match files without define calls', () => {
    const fileContent = `
      import { defineFrontComponent } from 'twenty-sdk/define';
      export const helper = () => 'defineFrontComponent';
    `;
    expect(findReferencedTargetFunctions(fileContent)).toEqual([]);
  });

  it('should not match a define function name embedded in a longer identifier', () => {
    const fileContent = `
      const myDefineObject = (config: unknown) => config;
      export default myDefineObject({});
    `;
    expect(findReferencedTargetFunctions(fileContent)).toEqual([]);
  });
});
