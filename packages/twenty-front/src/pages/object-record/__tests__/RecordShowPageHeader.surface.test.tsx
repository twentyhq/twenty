import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { render, screen } from '@testing-library/react';

jest.mock('@/object-metadata/utils/getObjectMetadataIdentifierFields', () => ({
  getObjectMetadataIdentifierFields: () => ({
    labelIdentifierFieldMetadataItem: { id: 'label-field' },
  }),
}));

jest.mock(
  '@/object-record/record-show/hooks/useRecordShowPagePagination',
  () => ({
    useRecordShowPagePagination: () => ({
      objectMetadataItem: { labelPlural: 'People' },
    }),
  }),
);

jest.mock(
  '@/object-record/record-show/components/ObjectRecordShowPageBreadcrumb',
  () => ({
    ObjectRecordShowPageBreadcrumb: () => (
      <div data-testid="main-record-breadcrumb" />
    ),
  }),
);

jest.mock(
  '@/object-record/record-show/components/RecordIdentifierBarTitle',
  () => ({
    RecordIdentifierBarTitle: ({
      recordLinkSurface,
    }: {
      recordLinkSurface?: 'main';
    }) => (
      <div
        data-testid="panel-record-title"
        data-record-link-surface={recordLinkSurface}
      />
    ),
  }),
);

jest.mock(
  '@/object-record/record-show/components/RecordIdentifierBarCreatedAt',
  () => ({
    RecordIdentifierBarCreatedAt: () => (
      <div data-testid="panel-record-created-at" />
    ),
  }),
);

jest.mock('@/ui/layout/page/components/PageCardHeader', () => ({
  PageCardHeader: ({
    actionButton,
    breadcrumb,
    title,
  }: {
    actionButton?: React.ReactNode;
    breadcrumb?: React.ReactNode;
    title?: React.ReactNode;
  }) => (
    <div>
      {breadcrumb}
      {title}
      {actionButton}
    </div>
  ),
}));

describe('RecordShowPageHeader workspace surface composition', () => {
  const header = (
    <RecordShowPageHeader objectNameSingular="person" objectRecordId="record-1">
      <div data-testid="main-record-actions" />
    </RecordShowPageHeader>
  );

  it('keeps the canonical breadcrumb and actions on the main surface', () => {
    render(header);

    expect(screen.getByTestId('main-record-breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('main-record-actions')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-record-title')).not.toBeInTheDocument();
  });

  it('uses concise record identity chrome on the panel surface', () => {
    render(
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: 'side-panel-page-1',
          ownsRouteLocation: true,
        }}
      >
        {header}
      </WorkspaceSurfaceContext.Provider>,
    );

    expect(screen.getByTestId('panel-record-title')).toHaveAttribute(
      'data-record-link-surface',
      'main',
    );
    expect(screen.getByTestId('panel-record-created-at')).toBeInTheDocument();
    expect(
      screen.queryByTestId('main-record-breadcrumb'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('main-record-actions')).not.toBeInTheDocument();
  });
});
