import { getPageLayoutWidgetBaseFile } from '@/cli/utilities/entity/entity-page-layout-widget-template';

describe('getPageLayoutWidgetBaseFile', () => {
  it('should render proper file using definePageLayoutWidget', () => {
    const result = getPageLayoutWidgetBaseFile({
      name: 'My Custom Widget',
    });

    expect(result).toContain('definePageLayoutWidget,');
    expect(result).toContain("} from 'twenty-sdk/define';");
    expect(result).toContain('export default definePageLayoutWidget({');
    expect(result).toContain("title: 'My Custom Widget'");
    expect(result).toContain('pageLayoutTabUniversalIdentifier:');
    expect(result).toContain(
      'position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1000 }',
    );
    expect(result).toContain("configurationType: 'IFRAME'");
  });

  it('should generate a valid UUID for the widget', () => {
    const result = getPageLayoutWidgetBaseFile({
      name: 'widget',
    });

    const uuidRegex =
      /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/g;
    const matches = result.match(uuidRegex);

    expect(matches).toHaveLength(1);
  });

  it('should generate unique UUIDs across calls', () => {
    const result1 = getPageLayoutWidgetBaseFile({ name: 'widget-1' });
    const result2 = getPageLayoutWidgetBaseFile({ name: 'widget-2' });

    const uuidRegex =
      /universalIdentifier: '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/;
    const uuid1 = result1.match(uuidRegex)?.[1];
    const uuid2 = result2.match(uuidRegex)?.[1];

    expect(uuid1).toBeDefined();
    expect(uuid2).toBeDefined();
    expect(uuid1).not.toBe(uuid2);
  });
});
