import { GraphType, WidgetType } from '@/page-layout/mocks/mockWidgets';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { act, renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';
import { PageLayoutType } from '~/generated/graphql';
import { useCreatePageLayoutWidget } from '../useCreatePageLayoutWidget';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

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
          activeTabIdComponentState.atomFamily({
            instanceId: `${PAGE_LAYOUT_TEST_INSTANCE_ID}-tab-list`,
          }),
        );
        const setPageLayoutDraft = useSetRecoilComponentState(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const pageLayoutDraft = useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const pageLayoutCurrentLayouts = useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const createWidget = useCreatePageLayoutWidget(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        return {
          setActiveTabId,
          setPageLayoutDraft,
          allWidgets,
          pageLayoutCurrentLayouts,
          createWidget,
        };
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
        GraphType.BAR,
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
        const setPageLayoutDraft = useSetRecoilComponentState(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const setActiveTabId = useSetRecoilState(
          activeTabIdComponentState.atomFamily({
            instanceId: `${PAGE_LAYOUT_TEST_INSTANCE_ID}-tab-list`,
          }),
        );
        const pageLayoutDraft = useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const pageLayoutCurrentLayouts = useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const createWidget = useCreatePageLayoutWidget(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        return {
          setPageLayoutDraft,
          setActiveTabId,
          pageLayoutDraft,
          allWidgets,
          pageLayoutCurrentLayouts,
          createWidget,
        };
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
      GraphType.NUMBER,
      GraphType.GAUGE,
      GraphType.PIE,
      GraphType.BAR,
    ];

    graphTypes.forEach((graphType) => {
      act(() => {
        result.current.createWidget.createPageLayoutWidget(
          WidgetType.GRAPH,
          graphType,
        );
      });
    });

    expect(result.current.allWidgets).toHaveLength(4);

    graphTypes.forEach((graphType, index) => {
      const widget = result.current.allWidgets[index];
      expect(widget.type).toBe(WidgetType.GRAPH);
      expect(widget.pageLayoutTabId).toBe('tab-1');
      expect(widget.configuration.graphType).toBe(graphType);
      expect(widget.id).toBe('widget-mock-uuid');
    });

    expect(result.current.pageLayoutCurrentLayouts['tab-1']).toBeDefined();
    expect(
      result.current.pageLayoutCurrentLayouts['tab-1'].desktop,
    ).toHaveLength(4);
    expect(
      result.current.pageLayoutCurrentLayouts['tab-1'].mobile,
    ).toHaveLength(4);

    expect(result.current.pageLayoutDraft.tabs[0].widgets).toHaveLength(4);
  });

  it('should not create widget when activeTabId is null', () => {
    const { result } = renderHook(
      () => {
        const pageLayoutDraft = useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);
        const pageLayoutCurrentLayouts = useRecoilComponentValue(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const createWidget = useCreatePageLayoutWidget(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        return { allWidgets, pageLayoutCurrentLayouts, createWidget };
      },
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.createWidget.createPageLayoutWidget(
        WidgetType.GRAPH,
        GraphType.BAR,
      );
    });

    expect(result.current.allWidgets).toHaveLength(0);
    expect(Object.keys(result.current.pageLayoutCurrentLayouts)).toHaveLength(
      0,
    );
  });
});
