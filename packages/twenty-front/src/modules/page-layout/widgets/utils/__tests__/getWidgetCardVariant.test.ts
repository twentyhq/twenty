import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import { PageLayoutType } from '~/generated-metadata/graphql';

const baseParams = {
  isInPinnedTab: false,
  isMobile: false,
  isInSidePanel: false,
};

describe('getWidgetCardVariant', () => {
  describe('when presentation is solo', () => {
    it.each([
      PageLayoutType.RECORD_PAGE,
      PageLayoutType.STANDALONE_PAGE,
      PageLayoutType.DASHBOARD,
      PageLayoutType.RECORD_INDEX,
    ])("returns 'solo' regardless of pageLayoutType (%s)", (pageLayoutType) => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          presentation: 'solo',
          pageLayoutType,
        }),
      ).toBe('solo');
    });
  });

  describe('when presentation is stack', () => {
    it("returns 'dashboard' for DASHBOARD page", () => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          presentation: 'stack',
          pageLayoutType: PageLayoutType.DASHBOARD,
        }),
      ).toBe('dashboard');
    });

    it("returns 'standalone' for STANDALONE_PAGE", () => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          presentation: 'stack',
          pageLayoutType: PageLayoutType.STANDALONE_PAGE,
        }),
      ).toBe('standalone');
    });

    it("returns 'record-page' for RECORD_PAGE by default", () => {
      expect(
        getWidgetCardVariant({
          ...baseParams,
          presentation: 'stack',
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
          presentation: 'stack',
          pageLayoutType: PageLayoutType.RECORD_PAGE,
        }),
      ).toBe('side-column');
    });
  });
});
