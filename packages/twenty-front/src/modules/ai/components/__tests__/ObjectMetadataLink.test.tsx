import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ObjectMetadataLink } from '@/ai/components/ObjectMetadataLink';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const renderObjectMetadataLink = ({
  objectNameSingular,
  displayName,
}: {
  objectNameSingular: string;
  displayName: string;
}) =>
  render(
    <MemoryRouter>
      <ObjectMetadataLink
        objectNameSingular={objectNameSingular}
        displayName={displayName}
      />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );

describe('ObjectMetadataLink', () => {
  it('should link an existing object to its record index page', () => {
    renderObjectMetadataLink({
      objectNameSingular: 'company',
      displayName: 'Companies',
    });

    expect(screen.getByText('Companies').closest('a')).toHaveAttribute(
      'href',
      '/objects/companies',
    );
  });

  it('should render a chip without a link for an object that does not exist yet', () => {
    renderObjectMetadataLink({
      objectNameSingular: 'partner',
      displayName: 'Partners',
    });

    expect(screen.getByText('Partners')).toBeInTheDocument();
    expect(screen.getByText('Partners').closest('a')).toBeNull();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
  });
});
