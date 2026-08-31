import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RoleLink } from '@/ai/components/RoleLink';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const ROLE_ID = '55555555-5555-4555-8555-555555555555';

const renderRoleLink = (permissionFlags: PermissionFlagType[]) => {
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
      <RoleLink roleId={ROLE_ID} displayName="Admin" />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

describe('RoleLink', () => {
  it('should link to the role settings page when allowed', () => {
    renderRoleLink([PermissionFlagType.ROLES]);

    expect(screen.getByText('Admin').closest('a')).toHaveAttribute(
      'href',
      `/settings/members/roles/${ROLE_ID}`,
    );
  });

  it('should render a chip without a link when roles settings are forbidden', () => {
    renderRoleLink([]);

    expect(screen.getByText('Admin').closest('a')).toBeNull();
    expect(screen.getByTestId('chip')).toBeInTheDocument();
  });
});
