import { render, screen } from '@testing-library/react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { ViewWidgetRenderer } from '@/page-layout/widgets/view/components/ViewWidgetRenderer';
import { useViewById } from '@/views/hooks/useViewById';
import { type View } from '@/views/types/View';
import {
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

jest.mock('@/views/hooks/useViewById', () => ({
  useViewById: jest.fn(),
}));

jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent',
  () => ({
    RecordTableWidgetRendererContent: ({
      viewId,
      isViewLocked,
    }: {
      viewId: string;
      isViewLocked?: boolean;
    }) => (
      <div data-testid="widget-content">
        {`${viewId}:${isViewLocked ? 'locked' : 'unlocked'}`}
      </div>
    ),
  }),
);

const mockedUseViewById = jest.mocked(useViewById);

const VIEW_WIDGET = {
  id: 'widget-id',
  type: WidgetType.VIEW,
  objectMetadataId: 'object-metadata-id',
  configuration: {
    __typename: 'ViewConfiguration',
    configurationType: WidgetConfigurationType.VIEW,
    viewId: 'view-id',
  },
} as PageLayoutWidget;

describe('ViewWidgetRenderer', () => {
  it('renders the referenced view as locked', () => {
    mockedUseViewById.mockReturnValue({ view: { id: 'view-id' } as View });

    render(<ViewWidgetRenderer widget={VIEW_WIDGET} />);

    expect(screen.getByTestId('widget-content')).toHaveTextContent(
      'view-id:locked',
    );
  });

  it('shows an unavailable state when the referenced view was deleted', () => {
    mockedUseViewById.mockReturnValue({ view: undefined });

    render(<ViewWidgetRenderer widget={VIEW_WIDGET} />);

    expect(screen.getByText('View unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-content')).not.toBeInTheDocument();
  });
});
