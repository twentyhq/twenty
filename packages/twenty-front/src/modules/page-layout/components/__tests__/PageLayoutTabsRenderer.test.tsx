import { type I18n } from '@lingui/core';

import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import {
  getPageLayoutTabsForCurrentObject,
  getSystemObjectTabTitles,
} from '@/page-layout/utils/getPageLayoutTabsForCurrentObject';

const createMockTab = (id: string, title: string): PageLayoutTab => ({
  __typename: 'PageLayoutTab',
  applicationId: '',
  id,
  isActive: true,
  pageLayoutId: 'page-layout-1',
  title,
  position: 0,
  widgets: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
});

describe('PageLayoutTabsRenderer', () => {
  it('keeps translated system object tabs in non-English locales', () => {
    const translatedSystemObjectTabTitles = [
      'ホーム',
      'タイムライン',
      '概要',
      'フロー',
    ];

    const mockI18n = {
      _: jest
        .fn()
        .mockReturnValueOnce(translatedSystemObjectTabTitles[0])
        .mockReturnValueOnce(translatedSystemObjectTabTitles[1])
        .mockReturnValueOnce(translatedSystemObjectTabTitles[2])
        .mockReturnValueOnce(translatedSystemObjectTabTitles[3]),
    } as unknown as I18n;

    const systemObjectTabTitles = getSystemObjectTabTitles(mockI18n);

    const tabs = [
      createMockTab('home', translatedSystemObjectTabTitles[0]),
      createMockTab('timeline', translatedSystemObjectTabTitles[1]),
      createMockTab('overview', translatedSystemObjectTabTitles[2]),
      createMockTab('flow', translatedSystemObjectTabTitles[3]),
      createMockTab('custom', 'Custom'),
      createMockTab('english-home', 'Home'),
    ];

    const result = getPageLayoutTabsForCurrentObject({
      isSystemObject: true,
      tabsWithVisibleWidgets: tabs,
      systemObjectTabTitles,
    });

    expect(result).toHaveLength(4);
    expect(result.map((tab) => tab.title)).toEqual(
      translatedSystemObjectTabTitles,
    );
  });
});
