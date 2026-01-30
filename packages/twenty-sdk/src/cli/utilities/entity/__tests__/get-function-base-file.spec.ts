import { getLogicFunctionBaseFile } from '@/cli/utilities/entity/entity-logic-function-template';

describe('getFunctionBaseFile', () => {
  it('should render proper file using defineFunction', () => {
    const result = getLogicFunctionBaseFile({
      name: 'my-function',
      universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
    });

    expect(result).toContain(
      "import { defineLogicFunction } from 'twenty-sdk'",
    );
    expect(result).toContain('export default defineLogicFunction({');

    expect(result).toContain(
      "universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4'",
    );
    expect(result).toContain("name: 'my-function'");
    expect(result).toContain('timeoutSeconds: 5');
    expect(result).toContain('handler,');
    expect(result).toContain('triggers: [');

    expect(result).toContain('const handler = async');

    expect(result).toContain(
      "description: 'Add a description for your logic function'",
    );
  });

  it('should generate unique UUID when not provided', () => {
    const result = getLogicFunctionBaseFile({
      name: 'auto-uuid-function',
    });

    expect(result).toMatch(
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should use kebab-case for function name', () => {
    const result = getLogicFunctionBaseFile({
      name: 'my-awesome-function',
    });

    expect(result).toContain("name: 'my-awesome-function'");
    expect(result).toContain("path: '/my-awesome-function'");
  });

  it('should include trigger examples as comments', () => {
    const result = getLogicFunctionBaseFile({
      name: 'example-function',
    });

    expect(result).toContain("type: 'route'");
    expect(result).toContain("type: 'cron'");
    expect(result).toContain("type: 'databaseEvent'");
    expect(result).toContain("httpMethod: 'POST'");
    expect(result).toContain("pattern: '0 0 * * *'");
    expect(result).toContain("eventName: 'objectName.created'");
  });
});
