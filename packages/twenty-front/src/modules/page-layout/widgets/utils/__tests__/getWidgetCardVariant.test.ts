import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import { PageLayoutType } from '~/generated-metadata/graphql';

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
        }),
      ).toBe('flush');
    });
  });

  it("returns 'flush' in a side column context, even on a framed page", () => {
    expect(
      getWidgetCardVariant({
        isSideColumnContext: true,
        pageLayoutType: PageLayoutType.DASHBOARD,
      }),
    ).toBe('flush');
  });
});
