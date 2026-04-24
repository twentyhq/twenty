import { getPageLayoutTabBaseFile } from '@/cli/utilities/entity/entity-page-layout-tab-template';

describe('getPageLayoutTabBaseFile', () => {
  it('should render proper file using definePageLayoutTab', () => {
    const result = getPageLayoutTabBaseFile({
      name: 'My Custom Tab',
    });

    expect(result).toContain(
      "import { definePageLayoutTab, PageLayoutTabLayoutMode } from 'twenty-sdk/define';",
    );
    expect(result).toContain('export default definePageLayoutTab({');
    expect(result).toContain("title: 'My Custom Tab'");
    expect(result).toContain('pageLayoutUniversalIdentifier:');
    expect(result).toContain('widgets: []');
    expect(result).toContain('layoutMode: PageLayoutTabLayoutMode.CANVAS');
  });

  it('should generate a valid UUID for the tab', () => {
    const result = getPageLayoutTabBaseFile({
      name: 'tab',
    });

    const uuidRegex =
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/g;
    const matches = result.match(uuidRegex);

    expect(matches).toHaveLength(1);
  });

  it('should generate unique UUIDs across calls', () => {
    const result1 = getPageLayoutTabBaseFile({ name: 'tab-1' });
    const result2 = getPageLayoutTabBaseFile({ name: 'tab-2' });

    const uuidRegex =
      /universalIdentifier: '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const uuid1 = result1.match(uuidRegex)?.[1];
    const uuid2 = result2.match(uuidRegex)?.[1];

    expect(uuid1).toBeDefined();
    expect(uuid2).toBeDefined();
    expect(uuid1).not.toBe(uuid2);
  });
});
