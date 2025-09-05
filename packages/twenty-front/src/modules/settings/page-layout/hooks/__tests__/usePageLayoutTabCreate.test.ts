import { pageLayoutCurrentLayoutsState } from '@/settings/page-layout/states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '@/settings/page-layout/states/pageLayoutDraftState';
import { pageLayoutTabsState } from '@/settings/page-layout/states/pageLayoutTabsState';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { usePageLayoutTabCreate } from '../usePageLayoutTabCreate';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('usePageLayoutTabCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new tab with default title', () => {
    const uuidModule = require('uuid');
    uuidModule.v4.mockReturnValue('mock-uuid');
    const { result } = renderHook(
      () => ({
        createTab: usePageLayoutTabCreate(),
        pageLayoutTabs: useRecoilValue(pageLayoutTabsState),
        pageLayoutCurrentLayouts: useRecoilValue(pageLayoutCurrentLayoutsState),
        pageLayoutDraft: useRecoilValue(pageLayoutDraftState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    let newTabId: string;
    act(() => {
      newTabId = result.current.createTab.handleCreateTab();
    });

    expect(result.current.pageLayoutTabs).toHaveLength(1);
    expect(result.current.pageLayoutTabs[0].id).toBe('tab-mock-uuid');
    expect(result.current.pageLayoutTabs[0].title).toBe('Tab 1');
    expect(result.current.pageLayoutTabs[0].position).toBe(0);
    expect(result.current.pageLayoutTabs[0].widgets).toEqual([]);

    expect(result.current.pageLayoutCurrentLayouts['tab-mock-uuid']).toEqual({
      desktop: [],
      mobile: [],
    });

    expect(result.current.pageLayoutDraft.tabs).toHaveLength(1);

    expect(newTabId!).toBe('tab-mock-uuid');
  });

  it('should create a new tab with custom title', () => {
    const uuidModule = require('uuid');
    uuidModule.v4.mockReturnValue('mock-uuid');
    const { result } = renderHook(
      () => ({
        createTab: usePageLayoutTabCreate(),
        pageLayoutTabs: useRecoilValue(pageLayoutTabsState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.createTab.handleCreateTab('Custom Tab Name');
    });

    expect(result.current.pageLayoutTabs[0].title).toBe('Custom Tab Name');
  });

  it('should increment position for subsequent tabs', () => {
    const uuidModule = require('uuid');
    uuidModule.v4
      .mockReturnValueOnce('mock-uuid')
      .mockReturnValueOnce('mock-uuid-2');
    const { result } = renderHook(
      () => ({
        createTab: usePageLayoutTabCreate(),
        pageLayoutTabs: useRecoilValue(pageLayoutTabsState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.createTab.handleCreateTab();
    });

    act(() => {
      result.current.createTab.handleCreateTab();
    });

    expect(result.current.pageLayoutTabs).toHaveLength(2);
    expect(result.current.pageLayoutTabs[0].position).toBe(0);
    expect(result.current.pageLayoutTabs[0].title).toBe('Tab 1');
    expect(result.current.pageLayoutTabs[1].position).toBe(1);
    expect(result.current.pageLayoutTabs[1].title).toBe('Tab 2');
  });

  it('should create isolated layouts for multiple tabs', () => {
    const uuidModule = require('uuid');
    uuidModule.v4
      .mockReturnValueOnce('mock-uuid-1')
      .mockReturnValueOnce('mock-uuid-2');
    const { result } = renderHook(
      () => ({
        createTab: usePageLayoutTabCreate(),
        pageLayoutCurrentLayouts: useRecoilValue(pageLayoutCurrentLayoutsState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    let tabId1: string = '';
    act(() => {
      tabId1 = result.current.createTab.handleCreateTab();
    });

    let tabId2: string = '';
    act(() => {
      tabId2 = result.current.createTab.handleCreateTab();
    });

    expect(result.current.pageLayoutCurrentLayouts[tabId1]).toEqual({
      desktop: [],
      mobile: [],
    });
    expect(result.current.pageLayoutCurrentLayouts[tabId2]).toEqual({
      desktop: [],
      mobile: [],
    });
    expect(tabId1).not.toBe(tabId2);
  });
});
