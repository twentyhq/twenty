import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { act, renderHook } from '@testing-library/react';
import { GraphOrderBy, WidgetType } from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  BarChartLayout,
  PageLayoutType,
  WidgetConfigurationType,
} from '~/generated/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

describe('usePageLayoutDraftState', () => {
  it('should detect dirty state when draft differs from persisted', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    expect(result.current.isDirty).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it('should handle empty name as not saveable', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'test-layout',
        name: '   ',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [],
      });
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it('should allow updating draft state', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'test-layout',
        name: 'Updated Name',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [],
      });
    });

    expect(result.current.pageLayoutDraft.name).toBe('Updated Name');
    expect(result.current.canSave).toBe(true);
    expect(result.current.isDirty).toBe(true);
  });

  it('should detect changes in widgets', () => {
    const { result } = renderHook(
      () => usePageLayoutDraftState(PAGE_LAYOUT_TEST_INSTANCE_ID),
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            widgets: [
              {
                id: 'widget-1',
                pageLayoutTabId: 'tab-1',
                title: 'New Widget',
                type: WidgetType.GRAPH,
                gridPosition: { row: 2, column: 2, rowSpan: 2, columnSpan: 2 },
                configuration: {
                  configurationType: WidgetConfigurationType.BAR_CHART,
                  layout: BarChartLayout.VERTICAL,
                  aggregateOperation: AggregateOperations.COUNT,
                  aggregateFieldMetadataId: 'id',
                  primaryAxisGroupByFieldMetadataId: 'createdAt',
                  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
                  displayDataLabel: false,
                },
                objectMetadataId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null,
              },
            ],
          },
        ],
      });
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.canSave).toBe(true);
  });
});
