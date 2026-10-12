import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

describe('getWidgetCardVariant', () => {
  describe('page layout variants', () => {
    it.each([
      ['DASHBOARD', PageLayoutType.DASHBOARD],
      ['STANDALONE_PAGE', PageLayoutType.STANDALONE_PAGE],
    ])("returns 'framed' for %s", (_label, pageLayoutType) => {
      expect(
        getWidgetCardVariant({
          isSideColumnContext: false,
          pageLayoutType,
          presentation: 'stack',
          widgetType: WidgetType.FRONT_COMPONENT,
        }),
      ).toBe('framed');
    });

    it.each([
      ['RECORD_PAGE', PageLayoutType.RECORD_PAGE],
      ['RECORD_INDEX', PageLayoutType.RECORD_INDEX],
      ['no page layout type', null],
    ])("returns 'flush' for %s", (_label, pageLayoutType) => {
      expect(
        getWidgetCardVariant({
          isSideColumnContext: false,
          pageLayoutType,
          presentation: 'stack',
          widgetType: WidgetType.FRONT_COMPONENT,
        }),
      ).toBe('flush');
    });
  });

  it("returns 'flush' in a side column context, even on a framed page", () => {
    expect(
      getWidgetCardVariant({
        isSideColumnContext: true,
        pageLayoutType: PageLayoutType.DASHBOARD,
        presentation: 'stack',
        widgetType: WidgetType.FRONT_COMPONENT,
      }),
    ).toBe('flush');
  });
});
