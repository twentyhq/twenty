import { WidgetCardHeaderActionsRenderer } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionsRenderer';
import { render, screen } from '@testing-library/react';
import { WidgetType } from '~/generated-metadata/graphql';

const mockWidget = { id: 'widget-id', type: WidgetType.NOTES };

let mockIsPageLayoutInEditMode = false;
let mockWidgetOrNull: typeof mockWidget | null = mockWidget;
let mockTargetRecordIdentifier: { id: string } | null = { id: 'record-id' };

jest.mock('@/page-layout/widgets/hooks/useCurrentWidgetOrNull', () => ({
  useCurrentWidgetOrNull: () => mockWidgetOrNull,
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    targetRecordIdentifier: mockTargetRecordIdentifier,
  }),
}));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => mockIsPageLayoutInEditMode,
}));

jest.mock(
  '@/page-layout/widgets/constants/WidgetHeaderActionComponentsByWidgetType',
  () => ({
    WIDGET_HEADER_ACTION_COMPONENTS_BY_WIDGET_TYPE: {
      NOTES: [
        () => <button>Create</button>,
        () => <button>Filter</button>,
      ],
    },
  }),
);

describe('WidgetCardHeaderActionsRenderer', () => {
  beforeEach(() => {
    mockIsPageLayoutInEditMode = false;
    mockWidgetOrNull = mockWidget;
    mockTargetRecordIdentifier = { id: 'record-id' };
  });

  it('should render every action a widget declares', () => {
    render(<WidgetCardHeaderActionsRenderer />);

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('should render nothing when the widget type declares no action', () => {
    mockWidgetOrNull = { id: 'widget-id', type: WidgetType.TIMELINE };

    render(<WidgetCardHeaderActionsRenderer />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should hide record creating actions while the layout is being arranged', () => {
    mockIsPageLayoutInEditMode = true;

    render(<WidgetCardHeaderActionsRenderer />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render nothing without a target record', () => {
    mockTargetRecordIdentifier = null;

    render(<WidgetCardHeaderActionsRenderer />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
