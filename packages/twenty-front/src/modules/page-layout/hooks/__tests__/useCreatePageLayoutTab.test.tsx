import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { act, renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';
import { PageLayoutType } from '~/generated/graphql';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

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
        createTab: useCreatePageLayoutTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
        pageLayoutDraft: useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        pageLayoutCurrentLayouts: useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        activeTabId: useSetRecoilState(
          activeTabIdComponentState.atomFamily({
            instanceId: `${PAGE_LAYOUT_TEST_INSTANCE_ID}-tab-list`,
          }),
        ),
      }),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    expect(result.current.pageLayoutDraft.tabs).toHaveLength(1);
    expect(result.current.pageLayoutDraft.tabs[0].id).toBe('mock-uuid');
    expect(result.current.pageLayoutDraft.tabs[0].title).toBe('Tab 1');
    expect(result.current.pageLayoutDraft.tabs[0].position).toBe(0);
    expect(result.current.pageLayoutDraft.tabs[0].widgets).toEqual([]);

    expect(result.current.pageLayoutCurrentLayouts['mock-uuid']).toEqual({
      desktop: [],
      mobile: [],
    });
  });

  it('should create a new tab with custom title', () => {
    const uuidModule = require('uuid');
    uuidModule.v4.mockReturnValue('mock-uuid');

    const { result } = renderHook(
      () => ({
        createTab: useCreatePageLayoutTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
        pageLayoutDraft: useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: PageLayoutTestWrapper,
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
      .mockReturnValueOnce('mock-uuid-1')
      .mockReturnValueOnce('mock-uuid-2');

    const { result } = renderHook(
      () => ({
        createTab: useCreatePageLayoutTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
        pageLayoutDraft: useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    expect(result.current.pageLayoutDraft.tabs).toHaveLength(2);
    expect(result.current.pageLayoutDraft.tabs[0].id).toBe('mock-uuid-1');
    expect(result.current.pageLayoutDraft.tabs[0].position).toBe(0);
    expect(result.current.pageLayoutDraft.tabs[0].title).toBe('Tab 1');
    expect(result.current.pageLayoutDraft.tabs[1].id).toBe('mock-uuid-2');
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
        createTab: useCreatePageLayoutTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
        pageLayoutCurrentLayouts: useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    const tabIds = Object.keys(result.current.pageLayoutCurrentLayouts);
    expect(tabIds).toHaveLength(2);
    expect(tabIds).toContain('mock-uuid-1');
    expect(tabIds).toContain('mock-uuid-2');

    expect(result.current.pageLayoutCurrentLayouts['mock-uuid-1']).toEqual({
      desktop: [],
      mobile: [],
    });
    expect(result.current.pageLayoutCurrentLayouts['mock-uuid-2']).toEqual({
      desktop: [],
      mobile: [],
    });
    expect(tabIds[0]).not.toBe(tabIds[1]);
  });

  it('should set newly created tab as active', () => {
    const uuidModule = require('uuid');
    uuidModule.v4.mockReturnValue('mock-uuid');

    const { result } = renderHook(
      () => {
        const getActiveTabId = useRecoilComponentValue(
          activeTabIdComponentState,
          `${PAGE_LAYOUT_TEST_INSTANCE_ID}-tab-list`,
        );
        return {
          createTab: useCreatePageLayoutTab(PAGE_LAYOUT_TEST_INSTANCE_ID),
          activeTabId: getActiveTabId,
        };
      },
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    expect(result.current.activeTabId).toBeNull();

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    expect(result.current.activeTabId).toBe('mock-uuid');
  });

  it('should handle creating tab when draft already has tabs', () => {
    const uuidModule = require('uuid');
    uuidModule.v4.mockReturnValue('mock-uuid-new');

    const { result } = renderHook(
      () => {
        const setPageLayoutDraft = useSetRecoilComponentState(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const pageLayoutDraft = useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const createTab = useCreatePageLayoutTab(PAGE_LAYOUT_TEST_INSTANCE_ID);
        return { setPageLayoutDraft, pageLayoutDraft, createTab };
      },
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'test-layout',
        name: 'Test Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: 'existing-tab',
            title: 'Existing Tab',
            position: 0,
            pageLayoutId: 'test-layout',
            widgets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ],
      });
    });

    act(() => {
      result.current.createTab.createPageLayoutTab();
    });

    expect(result.current.pageLayoutDraft.tabs).toHaveLength(2);
    expect(result.current.pageLayoutDraft.tabs[1].id).toBe('mock-uuid-new');
    expect(result.current.pageLayoutDraft.tabs[1].position).toBe(1);
    expect(result.current.pageLayoutDraft.tabs[1].title).toBe('Tab 2');
  });
});
