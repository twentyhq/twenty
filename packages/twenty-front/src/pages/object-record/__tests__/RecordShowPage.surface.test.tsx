import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { RecordShowPage } from '~/pages/object-record/RecordShowPage';
import { render, screen } from '@testing-library/react';

let mockObjectMetadataItems = [{ nameSingular: 'person' }];
let mockRecordResource: {
  record: { id: string } | undefined;
  loading: boolean;
  error: Error | undefined;
} = {
  record: { id: 'record-1' },
  loading: false,
  error: undefined,
};

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    objectNameSingular: 'person',
    objectRecordId: 'record-1',
  }),
}));

jest.mock('@/object-record/record-show/hooks/useRecordShowPage', () => ({
  useRecordShowPage: () => ({
    objectNameSingular: 'person',
    objectRecordId: 'record-1',
  }),
}));

jest.mock(
  '@/object-record/record-show/hooks/useRecordShowPageResource',
  () => ({
    useRecordShowPageResource: () => mockRecordResource,
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: mockObjectMetadataItems,
  }),
}));

jest.mock('@/app/routing/components/WorkspaceRouteUnavailable', () => ({
  WorkspaceRouteUnavailable: () => <div data-testid="route-unavailable" />,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => false,
}));

jest.mock(
  '@/object-record/components/RecordComponentInstanceContextsWrapper',
  () => ({
    RecordComponentInstanceContextsWrapper: ({
      children,
      componentInstanceId,
    }: {
      children: React.ReactNode;
      componentInstanceId: string;
    }) => (
      <div
        data-component-instance-id={componentInstanceId}
        data-testid="record-contexts"
      >
        {children}
      </div>
    ),
  }),
);

jest.mock(
  '@/object-record/record-show/components/PageLayoutRecordPageRenderer',
  () => ({
    PageLayoutRecordPageRenderer: () => <div data-testid="record-renderer" />,
  }),
);

jest.mock(
  '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect',
  () => ({
    RecordShowPageSSESubscribeEffect: () => <div data-testid="record-sse" />,
  }),
);

jest.mock('@/ui/layout/page/components/PageCardLayout', () => ({
  PageCardLayout: ({
    children,
    header,
  }: {
    children: React.ReactNode;
    header: React.ReactNode;
  }) => (
    <div data-testid="page-card-layout">
      {header}
      {children}
    </div>
  ),
}));

jest.mock('~/pages/object-record/RecordShowPageHeader', () => ({
  RecordShowPageHeader: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="record-header">{children}</div>
  ),
}));

jest.mock('~/pages/object-record/RecordShowPageTitle', () => ({
  RecordShowPageTitle: () => <div data-testid="record-page-title" />,
}));

jest.mock('@/command-menu-item/components/RecordShowCommandMenu', () => ({
  RecordShowCommandMenu: () => <div data-testid="main-command-menu" />,
}));

jest.mock('@/side-panel/components/SidePanelToggleButton', () => ({
  SidePanelToggleButton: () => <div data-testid="side-panel-toggle" />,
}));

describe('RecordShowPage workspace surface composition', () => {
  beforeEach(() => {
    mockObjectMetadataItems = [{ nameSingular: 'person' }];
    mockRecordResource = {
      record: { id: 'record-1' },
      loading: false,
      error: undefined,
    };
  });

  it('keeps the existing main-page chrome and canonical renderer', () => {
    render(<RecordShowPage />);

    expect(screen.getByTestId('record-contexts')).toHaveAttribute(
      'data-component-instance-id',
      'record-show-record-1',
    );
    expect(screen.getByTestId('page-card-layout')).toBeInTheDocument();
    expect(screen.getByTestId('record-page-title')).toBeInTheDocument();
    expect(screen.getByTestId('record-header')).toBeInTheDocument();
    expect(screen.getByTestId('main-command-menu')).toBeInTheDocument();
    expect(screen.getByTestId('side-panel-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('record-renderer')).toBeInTheDocument();
  });

  it('uses the canonical renderer and header on a secondary surface', () => {
    render(
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: 'side-panel-page-1',
          ownsRouteLocation: true,
        }}
      >
        <RecordShowPage />
      </WorkspaceSurfaceContext.Provider>,
    );

    expect(screen.getByTestId('record-contexts')).toHaveAttribute(
      'data-component-instance-id',
      'record-show-record-1-side-panel-page-1',
    );
    expect(screen.getByTestId('record-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-card-layout')).toBeInTheDocument();
    expect(screen.getByTestId('record-page-title')).toBeInTheDocument();
    expect(screen.queryByTestId('main-command-menu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('side-panel-toggle')).not.toBeInTheDocument();
    expect(screen.getByTestId('record-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('record-sse')).toBeInTheDocument();
  });

  it('renders a panel-local fallback for a removed object', () => {
    mockObjectMetadataItems = [];

    render(
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: 'side-panel-page-1',
          ownsRouteLocation: true,
        }}
      >
        <RecordShowPage />
      </WorkspaceSurfaceContext.Provider>,
    );

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('record-renderer')).not.toBeInTheDocument();
  });

  it.each([
    {
      label: 'missing',
      resource: { record: undefined, loading: false, error: undefined },
    },
    {
      label: 'failed',
      resource: {
        record: undefined,
        loading: false,
        error: new Error('Not found'),
      },
    },
  ])('contains a $label record resource in the panel', ({ resource }) => {
    mockRecordResource = resource;

    render(
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: 'side-panel-page-1',
          ownsRouteLocation: true,
        }}
      >
        <RecordShowPage />
      </WorkspaceSurfaceContext.Provider>,
    );

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('record-renderer')).not.toBeInTheDocument();
  });

  it('preserves the canonical main page while its resource is missing', () => {
    mockRecordResource = {
      record: undefined,
      loading: false,
      error: new Error('Not found'),
    };

    render(<RecordShowPage />);

    expect(screen.getByTestId('record-renderer')).toBeInTheDocument();
    expect(screen.queryByTestId('route-unavailable')).not.toBeInTheDocument();
  });
});
