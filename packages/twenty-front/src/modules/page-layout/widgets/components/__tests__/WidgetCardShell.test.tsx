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
  WidgetContentRenderer: ({ isTabViewport }: { isTabViewport: boolean }) => (
    <div
      data-is-tab-viewport={String(isTabViewport)}
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
  layoutMode?: PageLayoutTabLayoutMode;
  variant?: WidgetCardVariant;
  widgetType?: WidgetType;
};

const renderWidgetCardShell = ({
  layoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST,
  variant = 'flush',
  widgetType = WidgetType.FIELDS,
}: RenderWidgetCardShellParams = {}) =>
  render(
    <PageLayoutContentProvider value={{ layoutMode, tabId: 'tab-under-test' }}>
      <WidgetCardShell
        widget={{ ...widget, type: widgetType }}
        variant={variant}
        isEditable={false}
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

  it('forwards intrinsic TAB_VIEWPORT treatment for Timeline', () => {
    renderWidgetCardShell({ widgetType: WidgetType.TIMELINE });

    expect(screen.getByTestId('widget-content')).toHaveAttribute(
      'data-is-tab-viewport',
      'true',
    );
  });

  it('keeps the iframe fixed-height treatment', () => {
    renderWidgetCardShell({ widgetType: WidgetType.IFRAME });

    expect(mockWidgetCardContent).toHaveBeenCalledWith(
      expect.objectContaining({ isFixedHeight: true }),
    );
  });
});
