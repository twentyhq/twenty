import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

const buildTab = (layoutMode: PageLayoutTabLayoutMode) =>
  ({ layoutMode }) as unknown as PageLayoutTab;

describe('getTabLayoutMode', () => {
  describe('page types that respect tab.layoutMode', () => {
    it.each([PageLayoutType.RECORD_PAGE, PageLayoutType.STANDALONE_PAGE])(
      "returns the tab's layoutMode for %s",
      (pageLayoutType) => {
        const tab = buildTab(PageLayoutTabLayoutMode.CANVAS);

        expect(getTabLayoutMode({ tab, pageLayoutType })).toBe(
          PageLayoutTabLayoutMode.CANVAS,
        );
      },
    );

    it.each([PageLayoutType.RECORD_PAGE, PageLayoutType.STANDALONE_PAGE])(
      'throws when tab is undefined for %s',
      (pageLayoutType) => {
        expect(() =>
          getTabLayoutMode({ tab: undefined, pageLayoutType }),
        ).toThrow('Tab layout mode is not defined');
      },
    );
  });

  describe('page types that ignore tab.layoutMode and default to GRID', () => {
    it.each([PageLayoutType.DASHBOARD, PageLayoutType.RECORD_INDEX])(
      'returns GRID for %s regardless of tab.layoutMode',
      (pageLayoutType) => {
        const tab = buildTab(PageLayoutTabLayoutMode.CANVAS);

        expect(getTabLayoutMode({ tab, pageLayoutType })).toBe(
          PageLayoutTabLayoutMode.GRID,
        );
      },
    );
  });
});
