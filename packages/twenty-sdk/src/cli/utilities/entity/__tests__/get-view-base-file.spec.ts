import { getViewBaseFile } from '@/cli/utilities/entity/entity-view-template';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'app-abc-123';

const getTestViewBaseFile = (
  overrides: Omit<
    Parameters<typeof getViewBaseFile>[0],
    'applicationUniversalIdentifier'
  >,
) =>
  getViewBaseFile({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    ...overrides,
  });

describe('getViewBaseFile', () => {
  it('should render proper file using defineView', () => {
    const result = getTestViewBaseFile({
      name: 'my-view',
      universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
      objectUniversalIdentifier: 'obj-abc-123',
    });

    expect(result).toContain("import { defineView } from 'twenty-sdk/define';");
    expect(result).toContain('export default defineView({');
    expect(result).toContain(
      "universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4'",
    );
    expect(result).toContain("name: 'my-view'");
    expect(result).toContain("objectUniversalIdentifier: 'obj-abc-123'");
    expect(result).toContain("icon: 'IconList'");
    expect(result).toContain('position: 0');
  });

  it('should use default objectUniversalIdentifier when not provided', () => {
    const result = getTestViewBaseFile({
      name: 'default-view',
    });

    expect(result).toContain("objectUniversalIdentifier: 'fill-later'");
  });

  it('should include commented fields, filters and sorts when no fields provided', () => {
    const result = getTestViewBaseFile({
      name: 'empty-view',
    });

    expect(result).toContain('// fields: [');
    expect(result).toContain('// filters: [');
    expect(result).toContain('// sorts: [');
  });

  it('should render fields block when fields are provided', () => {
    const result = getTestViewBaseFile({
      name: 'view-with-fields',
      fields: [
        {
          fieldMetadataUniversalIdentifier: 'field-uuid-1',
          position: 0,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataUniversalIdentifier: 'field-uuid-2',
          position: 1,
        },
      ],
    });

    expect(result).toContain('fields: [');
    expect(result).toContain('field-uuid-1');
    expect(result).toContain('field-uuid-2');
    expect(result).not.toContain('// fields: [');
  });

  it('should apply default values to fields', () => {
    const result = getTestViewBaseFile({
      name: 'view-defaults',
      fields: [
        {
          fieldMetadataUniversalIdentifier: 'field-uuid-1',
          position: 0,
        },
      ],
    });

    // Default isVisible is true, default size is 200
    expect(result).toContain('isVisible: true');
    expect(result).toContain('size: 200');
  });

  it('should generate unique UUID when not provided', () => {
    const result = getTestViewBaseFile({
      name: 'auto-uuid-view',
    });

    expect(result).toMatch(
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should use kebab-case for name', () => {
    const result = getTestViewBaseFile({
      name: 'all active contacts',
    });

    expect(result).toContain("name: 'all-active-contacts'");
  });

  it('should generate UUIDs for fields when not provided', () => {
    const result = getTestViewBaseFile({
      name: 'view-auto-field-uuids',
      fields: [
        {
          fieldMetadataUniversalIdentifier: 'field-uuid-1',
          position: 0,
        },
      ],
    });

    // The field should get a generated universalIdentifier
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
    const matches = result.match(uuidRegex);

    // At least 2 UUIDs: one for the view and one for the field
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it('should emit a generateDefaultFieldUniversalIdentifier call for fields using defaultFieldName', () => {
    const result = getTestViewBaseFile({
      name: 'view-default-field',
      objectUniversalIdentifier: 'obj-abc-123',
      fields: [
        {
          defaultFieldName: 'createdAt',
          position: 0,
        },
      ],
    });

    expect(result).toContain(
      "import {\n  defineView,\n  generateDefaultFieldUniversalIdentifier,\n} from 'twenty-sdk/define';",
    );
    expect(result).toContain(
      'fieldMetadataUniversalIdentifier: generateDefaultFieldUniversalIdentifier({',
    );
    expect(result).toContain("applicationUniversalIdentifier: 'app-abc-123'");
    expect(result).toContain("objectUniversalIdentifier: 'obj-abc-123'");
    expect(result).toContain("fieldName: 'createdAt'");
  });

  it('should not import generateDefaultFieldUniversalIdentifier when no field uses defaultFieldName', () => {
    const result = getTestViewBaseFile({
      name: 'view-literal-only',
      fields: [
        {
          fieldMetadataUniversalIdentifier: 'field-uuid-1',
          position: 0,
        },
      ],
    });

    expect(result).not.toContain('generateDefaultFieldUniversalIdentifier');
    expect(result).toContain("import { defineView } from 'twenty-sdk/define';");
  });
});
