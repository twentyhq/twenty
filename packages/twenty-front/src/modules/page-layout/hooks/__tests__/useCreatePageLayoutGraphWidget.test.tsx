import { useCreatePageLayoutGraphWidget } from '@/page-layout/hooks/useCreatePageLayoutGraphWidget';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { expect } from '@storybook/test';
import { act, renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';
import { PageLayoutType, WidgetConfigurationType } from '~/generated/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('useCreatePageLayoutGraphWidget', () => {
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
        const createWidget = useCreatePageLayoutGraphWidget(
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
      result.current.createWidget.createPageLayoutGraphWidget({
        fieldSelection: {
          groupByFieldMetadataIdX: 'test-groupby-field-id',
          aggregateFieldMetadataId: 'test-aggregate-field-id',
        },
      });
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
        const createWidget = useCreatePageLayoutGraphWidget(
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

    const widgetConfigurationTypes = [
      WidgetConfigurationType.AGGREGATE_CHART,
      WidgetConfigurationType.GAUGE_CHART,
      WidgetConfigurationType.PIE_CHART,
      WidgetConfigurationType.BAR_CHART,
    ];

    const mockFieldSelections: Partial<
      Record<WidgetConfigurationType, GraphWidgetFieldSelection>
    > = {
      [WidgetConfigurationType.AGGREGATE_CHART]: {
        objectMetadataId: 'test-object-id',
        aggregateFieldMetadataId: 'test-aggregate-field-id',
      },
      [WidgetConfigurationType.BAR_CHART]: {
        objectMetadataId: 'test-object-id',
        groupByFieldMetadataIdX: 'test-groupby-field-id',
        aggregateFieldMetadataId: 'test-aggregate-field-id',
      },
    };

    widgetConfigurationTypes.forEach((widgetConfigurationType) => {
      act(() => {
        const fieldSelection =
          mockFieldSelections[
            widgetConfigurationType as keyof typeof mockFieldSelections
          ];
        result.current.createWidget.createPageLayoutGraphWidget({
          fieldSelection,
        });
      });
    });

    expect(result.current.allWidgets).toHaveLength(4);

    widgetConfigurationTypes.forEach((widgetConfigurationType, index) => {
      const widget = result.current.allWidgets[index];
      expect(widget.type).toBe(WidgetType.GRAPH);
      expect(widget.pageLayoutTabId).toBe('tab-1');

      if (
        isDefined(widget.configuration) &&
        'graphType' in widget.configuration
      ) {
        expect(widget.configuration.configurationType).toBe(
          widgetConfigurationType,
        );
      }

      expect(widget.id).toBe('mock-uuid');
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

  it('should throw an error when activeTabId is null', () => {
    const { result } = renderHook(
      () => {
        const createWidget = useCreatePageLayoutGraphWidget(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        return { createWidget };
      },
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    expect(() => {
      result.current.createWidget.createPageLayoutGraphWidget({
        fieldSelection: {
          groupByFieldMetadataIdX: 'test-groupby-field-id',
          aggregateFieldMetadataId: 'test-aggregate-field-id',
        },
      });
    }).toThrow('A tab must be selected to create a new graph widget');
  });
});
