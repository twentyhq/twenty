import { pageLayoutCurrentLayoutsState } from '@/page-layout/states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '@/page-layout/states/pageLayoutDraftState';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { useCreatePageLayoutTab } from '../useCreatePageLayoutTab';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('useCreatePageLayoutTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new tab with default title', () => {
    const uuidModule = require('uuid');
    uuidModule.v4.mockReturnValue('mock-uuid');
    const { result } = renderHook(
      () => ({
        createTab: useCreatePageLayoutTab(),
        pageLayoutCurrentLayouts: useRecoilValue(pageLayoutCurrentLayoutsState),
        pageLayoutDraft: useRecoilValue(pageLayoutDraftState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    let newTabId: string;
    act(() => {
      newTabId = result.current.createTab.createPageLayoutTab();
    });

    expect(result.current.pageLayoutDraft.tabs[0].id).toBe('tab-mock-uuid');
    expect(result.current.pageLayoutDraft.tabs[0].title).toBe('Tab 1');
    expect(result.current.pageLayoutDraft.tabs[0].position).toBe(0);
    expect(result.current.pageLayoutDraft.tabs[0].widgets).toEqual([]);

    expect(result.current.pageLayoutCurrentLayouts['tab-mock-uuid']).toEqual({
      desktop: [],
      mobile: [],
    });

    expect(newTabId!).toBe('tab-mock-uuid');
  });

  it('should create a new tab with custom title', () => {
    const uuidModule = require('uuid');
    uuidModule.v4.mockReturnValue('mock-uuid');
    const { result } = renderHook(
      () => ({
        createTab: useCreatePageLayoutTab(),
        pageLayoutDraft: useRecoilValue(pageLayoutDraftState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.createTab.createPageLayoutTab('Custom Tab Name');
    });

    expect(result.current.pageLayoutDraft.tabs[0].title).toBe(
      'Custom Tab Name',
    );
  });

  it('should increment position for subsequent tabs', () => {
    const uuidModule = require('uuid');
    uuidModule.v4
      .mockReturnValueOnce('mock-uuid')
      .mockReturnValueOnce('mock-uuid-2');
    const { result } = renderHook(
      () => ({
        createTab: useCreatePageLayoutTab(),
        pageLayoutDraft: useRecoilValue(pageLayoutDraftState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    expect(result.current.pageLayoutDraft.tabs).toHaveLength(2);
    expect(result.current.pageLayoutDraft.tabs[0].position).toBe(0);
    expect(result.current.pageLayoutDraft.tabs[0].title).toBe('Tab 1');
    expect(result.current.pageLayoutDraft.tabs[1].position).toBe(1);
    expect(result.current.pageLayoutDraft.tabs[1].title).toBe('Tab 2');
  });

  it('should create isolated layouts for multiple tabs', () => {
    const uuidModule = require('uuid');
    uuidModule.v4
      .mockReturnValueOnce('mock-uuid-1')
      .mockReturnValueOnce('mock-uuid-2');
    const { result } = renderHook(
      () => ({
        createTab: useCreatePageLayoutTab(),
        pageLayoutCurrentLayouts: useRecoilValue(pageLayoutCurrentLayoutsState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    let tabId1: string = '';
    act(() => {
      tabId1 = result.current.createTab.createPageLayoutTab();
    });

    let tabId2: string = '';
    act(() => {
      tabId2 = result.current.createTab.createPageLayoutTab();
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
