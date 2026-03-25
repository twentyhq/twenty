import { getFrontComponentBaseFile } from '@/cli/utilities/entity/entity-front-component-template';

describe('getFrontComponentBaseFile', () => {
  it('should render proper file using defineFrontComponent', () => {
    const result = getFrontComponentBaseFile({
      name: 'my-component',
      universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
    });

    expect(result).toContain(
      "import { defineFrontComponent } from 'twenty-sdk'",
    );
    expect(result).toContain('export default defineFrontComponent({');

    expect(result).toContain(
      "universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4'",
    );
    expect(result).toContain("name: 'my-component'");
    expect(result).toContain('component: Component,');

    expect(result).toContain('const Component = () => {');

    expect(result).toContain(
      "description: 'Add a description for your front component'",
    );
  });

  it('should generate unique UUID when not provided', () => {
    const result = getFrontComponentBaseFile({
      name: 'auto-uuid-component',
    });

    expect(result).toMatch(
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should use kebab-case for component name', () => {
    const result = getFrontComponentBaseFile({
      name: 'my-awesome-component',
    });

    expect(result).toContain("name: 'my-awesome-component'");
  });

  it('should include JSX in the component', () => {
    const result = getFrontComponentBaseFile({
      name: 'example-component',
    });

    expect(result).toContain('<div');
    expect(result).toContain('<h1>My new component!</h1>');
    expect(result).toContain('</div>');
  });
});
