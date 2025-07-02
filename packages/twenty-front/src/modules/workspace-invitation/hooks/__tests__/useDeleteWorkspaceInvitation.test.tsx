import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { renderHook } from '@testing-library/react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationDeleteWorkspaceInvitationCallSpy = jest.fn();

jest.mock('~/generated-metadata/graphql', () => ({
  useDeleteWorkspaceInvitationMutation: () => [
    mutationDeleteWorkspaceInvitationCallSpy,
  ],
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useDeleteWorkspaceInvitation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Delete Workspace Invitation', async () => {
    const params = { appTokenId: 'test' };
    renderHook(
      () => {
        const { deleteWorkspaceInvitation } = useDeleteWorkspaceInvitation();
        deleteWorkspaceInvitation(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationDeleteWorkspaceInvitationCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: params,
    });
  });
});
