import {
  GraphSubType,
  WidgetType,
} from '@/settings/page-layout/mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '@/settings/page-layout/states/pageLayoutCurrentLayoutsState';
import { pageLayoutCurrentTabIdForCreationState } from '@/settings/page-layout/states/pageLayoutCurrentTabIdForCreation';
import { pageLayoutDraftState } from '@/settings/page-layout/states/pageLayoutDraftState';
import { PageLayoutType } from '@/settings/page-layout/states/savedPageLayoutsState';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
import { useCreatePageLayoutWidget } from '../useCreatePageLayoutWidget';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('useCreatePageLayoutWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create widget in the correct tab with isolated layouts', () => {
    const { result } = renderHook(
      () => {
        const setActiveTabId = useSetRecoilState(
          pageLayoutCurrentTabIdForCreationState,
        );
        const setPageLayoutDraft = useSetRecoilState(pageLayoutDraftState);
        const pageLayoutDraft = useRecoilValue(pageLayoutDraftState);
        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const pageLayoutCurrentLayouts = useRecoilValue(
          pageLayoutCurrentLayoutsState,
        );
        const createWidget = useCreatePageLayoutWidget();
        return {
          setActiveTabId,
          setPageLayoutDraft,
          allWidgets,
          pageLayoutCurrentLayouts,
          createWidget,
        };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        name: 'Test Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: 'tab-1',
            title: 'Tab 1',
            position: 0,
            pageLayoutId: '',
            widgets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ],
      });
      result.current.setActiveTabId('tab-1');
    });

    act(() => {
      result.current.createWidget.createPageLayoutWidget(
        WidgetType.GRAPH,
        GraphSubType.BAR,
      );
    });

    expect(result.current.allWidgets).toHaveLength(1);
    expect(result.current.allWidgets[0].pageLayoutTabId).toBe('tab-1');

    expect(result.current.pageLayoutCurrentLayouts['tab-1']).toBeDefined();
    expect(
      result.current.pageLayoutCurrentLayouts['tab-1'].desktop,
    ).toHaveLength(1);
    expect(result.current.pageLayoutCurrentLayouts['tab-2']).toBeUndefined();
  });

  it('should handle different graph types', () => {
    const { result } = renderHook(
      () => {
        const setPageLayoutDraft = useSetRecoilState(pageLayoutDraftState);
        const setActiveTabId = useSetRecoilState(
          pageLayoutCurrentTabIdForCreationState,
        );
        const createWidget = useCreatePageLayoutWidget();
        return {
          setPageLayoutDraft,
          setActiveTabId,
          createWidget,
        };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        name: 'Test Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: 'tab-1',
            title: 'Tab 1',
            position: 0,
            pageLayoutId: '',
            widgets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ],
      });
      result.current.setActiveTabId('tab-1');
    });

    const graphTypes = [
      GraphSubType.NUMBER,
      GraphSubType.GAUGE,
      GraphSubType.PIE,
      GraphSubType.BAR,
    ];

    graphTypes.forEach((graphType) => {
      act(() => {
        result.current.createWidget.createPageLayoutWidget(
          WidgetType.GRAPH,
          graphType,
        );
      });
    });

    expect(typeof result.current.createWidget.createPageLayoutWidget).toBe(
      'function',
    );
  });

  it('should not create widget when activeTabId is null', () => {
    const { result } = renderHook(
      () => {
        const pageLayoutDraft = useRecoilValue(pageLayoutDraftState);
        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const pageLayoutCurrentLayouts = useRecoilValue(
          pageLayoutCurrentLayoutsState,
        );
        const createWidget = useCreatePageLayoutWidget();
        return { allWidgets, pageLayoutCurrentLayouts, createWidget };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.createWidget.createPageLayoutWidget(
        WidgetType.GRAPH,
        GraphSubType.BAR,
      );
    });

    expect(result.current.allWidgets).toHaveLength(0);
    expect(Object.keys(result.current.pageLayoutCurrentLayouts)).toHaveLength(
      0,
    );
  });
});
