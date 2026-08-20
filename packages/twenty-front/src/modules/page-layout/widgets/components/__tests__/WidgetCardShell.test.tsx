import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

jest.mock('@/page-layout/widgets/components/WidgetContentRenderer', () => ({
  WidgetContentRenderer: ({ fillsViewport }: { fillsViewport: boolean }) => (
    <div
      data-fills-viewport={String(fillsViewport)}
      data-testid="widget-content"
    />
  ),
}));

const mockWidgetCardContent = jest.fn();

jest.mock(
  '@/page-layout/widgets/widget-card/components/WidgetCardContent',
  () => ({
    WidgetCardContent: ({
      children,
      ...props
    }: {
      children: ReactNode;
      isFixedHeight: boolean;
    }) => {
      mockWidgetCardContent(props);

      return <>{children}</>;
    },
  }),
);

const widget = {
  __typename: 'PageLayoutWidget',
  applicationId: '',
  configuration: {
    __typename: 'FieldsConfiguration',
    configurationType: WidgetConfigurationType.FIELDS,
    viewId: null,
  },
  createdAt: '2026-08-19T00:00:00.000Z',
  deletedAt: null,
  gridPosition: {
    __typename: 'GridPosition',
    column: 0,
    columnSpan: 4,
    row: 0,
    rowSpan: 4,
  },
  id: 'widget-under-test',
  isActive: true,
  isSystemSideEffect: false,
  objectMetadataId: null,
  pageLayoutTabId: 'tab-under-test',
  title: 'Widget under test',
  type: WidgetType.FIELDS,
  universalIdentifier: '20202020-0000-0000-0000-000000000001',
  updatedAt: '2026-08-19T00:00:00.000Z',
} satisfies PageLayoutWidget;

type RenderWidgetCardShellParams = {
  isEditable?: boolean;
  layoutMode?: PageLayoutTabLayoutMode;
  variant?: WidgetCardVariant;
  widgetType?: WidgetType;
};

const renderWidgetCardShell = ({
  isEditable = false,
  layoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST,
  variant = 'flush',
  widgetType = WidgetType.FIELDS,
}: RenderWidgetCardShellParams = {}) =>
  render(
    <PageLayoutContentProvider value={{ layoutMode, tabId: 'tab-under-test' }}>
      <WidgetCardShell
        widget={{ ...widget, type: widgetType }}
        variant={variant}
        isEditable={isEditable}
        isEditing={false}
        isDragging={false}
        isResizing={false}
        showHeader={false}
        hasAccess
        restriction={{ type: null }}
        onRemove={jest.fn()}
      />
    </PageLayoutContentProvider>,
  );

describe('WidgetCardShell layout behavior', () => {
  beforeEach(() => {
    mockWidgetCardContent.mockClear();
  });

  it('forwards intrinsic FILL_VIEWPORT sizing for Timeline', () => {
    renderWidgetCardShell({ widgetType: WidgetType.TIMELINE });

    expect(screen.getByTestId('widget-content')).toHaveAttribute(
      'data-fills-viewport',
      'true',
    );
  });

  it('keeps the iframe fixed-height treatment', () => {
    renderWidgetCardShell({ widgetType: WidgetType.IFRAME });

    expect(mockWidgetCardContent).toHaveBeenCalledWith(
      expect.objectContaining({ isFixedHeight: true }),
    );
  });

  it.each([
    WidgetType.WORKFLOW,
    WidgetType.WORKFLOW_VERSION,
    WidgetType.WORKFLOW_RUN,
  ])('removes content padding from %s canvases in view mode', (widgetType) => {
    renderWidgetCardShell({ widgetType });

    expect(mockWidgetCardContent).toHaveBeenCalledWith(
      expect.objectContaining({ contentPadding: 'none' }),
    );
  });

  it('keeps default content padding for task widgets', () => {
    renderWidgetCardShell({ widgetType: WidgetType.TASKS });

    expect(mockWidgetCardContent).toHaveBeenCalledWith(
      expect.objectContaining({ contentPadding: 'default' }),
    );
  });

  it('keeps default content padding around workflow canvases in edit mode', () => {
    renderWidgetCardShell({
      isEditable: true,
      widgetType: WidgetType.WORKFLOW,
    });

    expect(mockWidgetCardContent).toHaveBeenCalledWith(
      expect.objectContaining({ contentPadding: 'default' }),
    );
  });

  it('keeps default content padding around framed workflow canvases', () => {
    renderWidgetCardShell({
      variant: 'framed',
      widgetType: WidgetType.WORKFLOW,
    });

    expect(mockWidgetCardContent).toHaveBeenCalledWith(
      expect.objectContaining({ contentPadding: 'default' }),
    );
  });
});
