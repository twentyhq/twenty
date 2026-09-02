import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RoleLink } from '@/ai/components/RoleLink';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const ROLE_ID = '55555555-5555-4555-8555-555555555555';
const openRoutedPageInSidePanelMock = jest.fn();

jest.mock('@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel', () => ({
  useOpenRoutedPageInSidePanel: () => ({
    openRoutedPageInSidePanel: openRoutedPageInSidePanelMock,
  }),
}));

const renderRoleLink = (
  permissionFlags: PermissionFlagType[],
  initialPath = '/objects/companies',
) => {
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
    <MemoryRouter initialEntries={[initialPath]}>
      <RoleLink roleId={ROLE_ID} displayName="Admin" />
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
};

describe('RoleLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the role as an artifact on the chat page', () => {
    renderRoleLink([PermissionFlagType.ROLES], '/chat');

    const link = screen.getByText('Admin').closest('a') as HTMLElement;
    fireEvent.mouseDown(link);
    fireEvent.click(link);

    expect(openRoutedPageInSidePanelMock).toHaveBeenCalledWith({
      path: `/settings/members/roles/${ROLE_ID}`,
    });
  });

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
