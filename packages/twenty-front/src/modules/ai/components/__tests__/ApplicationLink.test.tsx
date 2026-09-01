import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ApplicationLink } from '@/ai/components/ApplicationLink';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const APPLICATION_ID = '66666666-6666-4666-8666-666666666666';

const renderApplicationLink = (permissionFlags: PermissionFlagType[]) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(currentUserWorkspaceState.atom, {
        permissionFlags,
        twoFactorAuthenticationMethodSummary: [],
        objectsPermissions: [],
      });
    },
  });

  return render(
    <MemoryRouter>
      <ApplicationLink applicationId={APPLICATION_ID} displayName="Twenty" />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

describe('ApplicationLink', () => {
  it('should link to the application settings page when allowed', () => {
    renderApplicationLink([PermissionFlagType.APPLICATIONS]);

    expect(screen.getByText('Twenty').closest('a')).toHaveAttribute(
      'href',
      `/settings/applications/${APPLICATION_ID}`,
    );
  });

  it('should render a chip without a link when application settings are forbidden', () => {
    renderApplicationLink([]);

    expect(screen.getByText('Twenty').closest('a')).toBeNull();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
  });
});
