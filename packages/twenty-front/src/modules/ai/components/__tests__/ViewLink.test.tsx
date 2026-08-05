import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ViewLink } from '@/ai/components/ViewLink';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const VIEW_ID = '44444444-4444-4444-4444-444444444444';

const allCompaniesView = {
  id: VIEW_ID,
  name: 'All Companies',
  icon: 'IconBuildingSkyscraper',
  objectMetadataId: companyObjectMetadataItem.id,
  isActive: true,
} as ViewWithRelations;

const renderViewLink = ({
  viewId,
  displayName,
  views,
}: {
  viewId: string;
  displayName: string;
  views: ViewWithRelations[];
}) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) =>
      setTestViewsInMetadataStore(store, views),
  });

  return render(
    <MemoryRouter>
      <ViewLink viewId={viewId} displayName={displayName} />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

describe('ViewLink', () => {
  it('should link a view to its object index page', () => {
    renderViewLink({
      viewId: VIEW_ID,
      displayName: 'All Companies',
      views: [allCompaniesView],
    });

    expect(screen.getByText('All Companies').closest('a')).toHaveAttribute(
      'href',
      `/objects/${companyObjectMetadataItem.namePlural}?viewId=${VIEW_ID}`,
    );
  });

  it('should render plain text for an unknown view id', () => {
    renderViewLink({
      viewId: VIEW_ID,
      displayName: 'All Companies',
      views: [],
    });

    expect(screen.getByText('All Companies')).toBeInTheDocument();
    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
  });

  it('should render plain text for an archived view', () => {
    renderViewLink({
      viewId: VIEW_ID,
      displayName: 'All Companies',
      views: [{ ...allCompaniesView, isActive: false }],
    });

    expect(screen.queryByTestId('chip')).not.toBeInTheDocument();
  });
});
