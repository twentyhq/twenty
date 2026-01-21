import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { act, renderHook } from '@testing-library/react';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('useDuplicatePageLayoutWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should deep clone widget configuration when duplicating', () => {
    const { result } = renderHook(
      () => {
        const setPageLayoutDraft = useSetRecoilComponentState(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const setPageLayoutCurrentLayouts = useSetRecoilComponentState(
          pageLayoutCurrentLayoutsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const pageLayoutDraft = useRecoilComponentValue(
          pageLayoutDraftComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );
        const { duplicateWidget } = useDuplicatePageLayoutWidget(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        );

        return {
          setPageLayoutDraft,
          setPageLayoutCurrentLayouts,
          pageLayoutDraft,
          duplicateWidget,
        };
      },
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    const now = new Date().toISOString();

    act(() => {
      result.current.setPageLayoutDraft({
        id: 'layout-1',
        name: 'Test Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            __typename: 'PageLayoutTab',
            id: 'tab-1',
            title: 'Tab 1',
            position: 0,
            pageLayoutId: 'layout-1',
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            widgets: [
              {
                __typename: 'PageLayoutWidget',
                id: 'widget-1',
                title: 'Notes',
                type: WidgetType.STANDALONE_RICH_TEXT,
                objectMetadataId: null,
                pageLayoutTabId: 'tab-1',
                gridPosition: {
                  __typename: 'GridPosition',
                  row: 0,
                  column: 0,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: {
                  __typename: 'StandaloneRichTextConfiguration',
                  configurationType:
                    WidgetConfigurationType.STANDALONE_RICH_TEXT,
                  body: {
                    __typename: 'RichTextV2Body',
                    blocknote: '[]',
                    markdown: null,
                  },
                },
                createdAt: now,
                updatedAt: now,
                deletedAt: null,
              },
            ],
          },
        ],
      });

      result.current.setPageLayoutCurrentLayouts({
        'tab-1': {
          desktop: [
            {
              i: 'widget-1',
              x: 0,
              y: 0,
              w: 2,
              h: 2,
            },
          ],
          mobile: [],
        },
      });
    });

    act(() => {
      result.current.duplicateWidget('widget-1');
    });

    const widgets = result.current.pageLayoutDraft.tabs[0].widgets;
    const sourceWidget = widgets.find((widget) => widget.id === 'widget-1');
    const duplicatedWidget = widgets.find(
      (widget) => widget.id === 'mock-uuid',
    );

    expect(widgets).toHaveLength(2);
    expect(sourceWidget).toBeDefined();
    expect(duplicatedWidget).toBeDefined();

    expect(duplicatedWidget?.configuration).toEqual(
      sourceWidget?.configuration,
    );
    expect(duplicatedWidget?.configuration).not.toBe(
      sourceWidget?.configuration,
    );

    expect(
      (duplicatedWidget?.configuration as { body?: unknown })?.body,
    ).not.toBe((sourceWidget?.configuration as { body?: unknown })?.body);
  });
});
