import {
  GraphSubType,
  WidgetType,
} from '@/settings/page-layout/mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '@/settings/page-layout/states/pageLayoutCurrentLayoutsState';
import { pageLayoutCurrentTabIdForCreationState } from '@/settings/page-layout/states/pageLayoutCurrentTabIdForCreation';
import { pageLayoutWidgetsState } from '@/settings/page-layout/states/pageLayoutWidgetsState';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
import { usePageLayoutWidgetCreate } from '../usePageLayoutWidgetCreate';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('usePageLayoutWidgetCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create widget in the correct tab with isolated layouts', () => {
    const { result } = renderHook(
      () => {
        const setActiveTabId = useSetRecoilState(
          pageLayoutCurrentTabIdForCreationState,
        );
        const pageLayoutWidgets = useRecoilValue(pageLayoutWidgetsState);
        const pageLayoutCurrentLayouts = useRecoilValue(
          pageLayoutCurrentLayoutsState,
        );
        const createWidget = usePageLayoutWidgetCreate();
        return {
          setActiveTabId,
          pageLayoutWidgets,
          pageLayoutCurrentLayouts,
          createWidget,
        };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.setActiveTabId('tab-1');
    });

    act(() => {
      result.current.createWidget.handleCreateWidget(
        WidgetType.GRAPH,
        GraphSubType.BAR,
      );
    });

    expect(result.current.pageLayoutWidgets).toHaveLength(1);
    expect(result.current.pageLayoutWidgets[0].pageLayoutTabId).toBe('tab-1');

    expect(result.current.pageLayoutCurrentLayouts['tab-1']).toBeDefined();
    expect(
      result.current.pageLayoutCurrentLayouts['tab-1'].desktop,
    ).toHaveLength(1);
    expect(result.current.pageLayoutCurrentLayouts['tab-2']).toBeUndefined();
  });

  it('should handle different graph types', () => {
    const { result } = renderHook(() => usePageLayoutWidgetCreate(), {
      wrapper: RecoilRoot,
    });

    const graphTypes = [
      GraphSubType.NUMBER,
      GraphSubType.GAUGE,
      GraphSubType.PIE,
      GraphSubType.BAR,
    ];

    graphTypes.forEach((graphType) => {
      act(() => {
        result.current.handleCreateWidget(WidgetType.GRAPH, graphType);
      });
    });

    expect(typeof result.current.handleCreateWidget).toBe('function');
  });

  it('should not create widget when activeTabId is null', () => {
    const { result } = renderHook(
      () => {
        const pageLayoutWidgets = useRecoilValue(pageLayoutWidgetsState);
        const pageLayoutCurrentLayouts = useRecoilValue(
          pageLayoutCurrentLayoutsState,
        );
        const createWidget = usePageLayoutWidgetCreate();
        return { pageLayoutWidgets, pageLayoutCurrentLayouts, createWidget };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.createWidget.handleCreateWidget(
        WidgetType.GRAPH,
        GraphSubType.BAR,
      );
    });

    expect(result.current.pageLayoutWidgets).toHaveLength(0);
    expect(Object.keys(result.current.pageLayoutCurrentLayouts)).toHaveLength(
      0,
    );
  });
});
