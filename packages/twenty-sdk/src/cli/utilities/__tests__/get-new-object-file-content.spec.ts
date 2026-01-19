import { getNewObjectFileContent } from '@/cli/utilities/entity/utils/entity-object-template';

describe('getNewObjectFileContent', () => {
  it('should return proper object file using defineObject', () => {
    const result = getNewObjectFileContent({
      data: {
        nameSingular: 'company',
        namePlural: 'companies',
        labelSingular: 'Company',
        labelPlural: 'Companies',
      },
      name: 'company',
    });

    // Verify it uses defineObject
    expect(result).toContain("import { defineObject } from 'twenty-sdk'");
    expect(result).toContain('export default defineObject({');

    // Verify object properties
    expect(result).toContain("nameSingular: 'company'");
    expect(result).toContain("namePlural: 'companies'");
    expect(result).toContain("labelSingular: 'Company'");
    expect(result).toContain("labelPlural: 'Companies'");
    expect(result).toContain("icon: 'IconBox'");
    expect(result).toContain('fields: [');

    // Verify it has a universalIdentifier (UUID format)
    expect(result).toMatch(
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should generate unique UUIDs for each object', () => {
    const result1 = getNewObjectFileContent({
      data: {
        nameSingular: 'company',
        namePlural: 'companies',
        labelSingular: 'Company',
        labelPlural: 'Companies',
      },
      name: 'company',
    });

    const result2 = getNewObjectFileContent({
      data: {
        nameSingular: 'person',
        namePlural: 'people',
        labelSingular: 'Person',
        labelPlural: 'People',
      },
      name: 'person',
    });

    // Extract UUIDs
    const uuidRegex =
      /universalIdentifier: '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const uuid1 = result1.match(uuidRegex)?.[1];
    const uuid2 = result2.match(uuidRegex)?.[1];

    expect(uuid1).toBeDefined();
    expect(uuid2).toBeDefined();
    expect(uuid1).not.toBe(uuid2);
  });
});
