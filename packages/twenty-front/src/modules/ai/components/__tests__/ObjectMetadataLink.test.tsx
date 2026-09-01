import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ObjectMetadataLink } from '@/ai/components/ObjectMetadataLink';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const renderObjectMetadataLink = ({
  objectNameSingular,
  displayName,
  permissionFlags = [PermissionFlagType.DATA_MODEL],
}: {
  objectNameSingular: string;
  displayName: string;
  permissionFlags?: PermissionFlagType[];
}) => {
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
      <ObjectMetadataLink
        objectNameSingular={objectNameSingular}
        displayName={displayName}
      />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

describe('ObjectMetadataLink', () => {
  it('should link an existing object to its data model settings page', () => {
    renderObjectMetadataLink({
      objectNameSingular: 'company',
      displayName: 'Companies',
    });

    expect(screen.getByText('Companies').closest('a')).toHaveAttribute(
      'href',
      '/settings/objects/companies',
    );
  });

  it('should render a chip without a link when data model settings are forbidden', () => {
    renderObjectMetadataLink({
      objectNameSingular: 'company',
      displayName: 'Companies',
      permissionFlags: [],
    });

    expect(screen.getByText('Companies').closest('a')).toBeNull();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
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
