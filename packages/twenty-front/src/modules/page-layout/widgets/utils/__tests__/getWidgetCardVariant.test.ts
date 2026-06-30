import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

const baseParams = {
  isInPinnedTab: false,
  isMobile: false,
  isInSidePanel: false,
};

describe('getWidgetCardVariant', () => {
  describe('when layoutMode is CANVAS', () => {
    it.each([
      PageLayoutType.RECORD_PAGE,
      PageLayoutType.STANDALONE_PAGE,
      PageLayoutType.DASHBOARD,
      PageLayoutType.RECORD_INDEX,
    ])(
      "returns 'canvas' regardless of pageLayoutType (%s)",
      (pageLayoutType) => {
        expect(
          getWidgetCardVariant({
            ...baseParams,
            layoutMode: PageLayoutTabLayoutMode.CANVAS,
            pageLayoutType,
          }),
        ).toBe('canvas');
      },
    );
  });

  describe('when layoutMode is GRID', () => {
    it("returns 'dashboard' for DASHBOARD page", () => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          layoutMode: PageLayoutTabLayoutMode.GRID,
          pageLayoutType: PageLayoutType.DASHBOARD,
        }),
      ).toBe('dashboard');
    });

    it("returns 'standalone' for STANDALONE_PAGE", () => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          layoutMode: PageLayoutTabLayoutMode.GRID,
          pageLayoutType: PageLayoutType.STANDALONE_PAGE,
        }),
      ).toBe('standalone');
    });

    it("returns 'record-page' for RECORD_PAGE by default", () => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          layoutMode: PageLayoutTabLayoutMode.GRID,
          pageLayoutType: PageLayoutType.RECORD_PAGE,
        }),
      ).toBe('record-page');
    });
  });

  describe('side-column context for record pages', () => {
    it.each([
      ['isInPinnedTab', { isInPinnedTab: true }],
      ['isMobile', { isMobile: true }],
      ['isInSidePanel', { isInSidePanel: true }],
    ])("returns 'side-column' when %s is true", (_label, override) => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          ...override,
          layoutMode: PageLayoutTabLayoutMode.GRID,
          pageLayoutType: PageLayoutType.RECORD_PAGE,
        }),
      ).toBe('side-column');
    });
  });
});
