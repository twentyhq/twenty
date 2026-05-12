import { getPageLayoutBaseFile } from '@/cli/utilities/entity/entity-page-layout-template';

describe('getPageLayoutBaseFile', () => {
  it('should render proper file using definePageLayout', () => {
    const result = getPageLayoutBaseFile({
      name: 'my-layout',
    });

    expect(result).toContain(
      "import { definePageLayout } from 'twenty-sdk/define';",
    );
    expect(result).toContain('export default definePageLayout({');
    expect(result).toContain("name: 'my-layout'");
    expect(result).toContain("title: 'Overview'");
    expect(result).toContain('widgets: []');
    expect(result).toContain('tabs: [');
  });

  it('should generate valid UUIDs for layout and tab', () => {
    const result = getPageLayoutBaseFile({
      name: 'test-layout',
    });

    const uuidRegex =
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/g;
    const matches = result.match(uuidRegex);

    // Should have two UUIDs: one for the layout and one for the tab
    expect(matches).toHaveLength(2);
  });

  it('should generate unique UUIDs for layout and tab', () => {
    const result = getPageLayoutBaseFile({
      name: 'unique-layout',
    });

    const uuidRegex =
      /universalIdentifier: '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/g;
    const uuids: string[] = [];
    let match;

    while ((match = uuidRegex.exec(result)) !== null) {
      uuids.push(match[1]);
    }

    expect(uuids[0]).not.toBe(uuids[1]);
  });

  it('should generate unique UUIDs across calls', () => {
    const result1 = getPageLayoutBaseFile({ name: 'layout-1' });
    const result2 = getPageLayoutBaseFile({ name: 'layout-2' });

    const uuidRegex =
      /universalIdentifier: '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const uuid1 = result1.match(uuidRegex)?.[1];
    const uuid2 = result2.match(uuidRegex)?.[1];

    expect(uuid1).toBeDefined();
    expect(uuid2).toBeDefined();
    expect(uuid1).not.toBe(uuid2);
  });
});
