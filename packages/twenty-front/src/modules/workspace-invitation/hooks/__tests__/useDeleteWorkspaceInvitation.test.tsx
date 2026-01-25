import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

const mutationDeleteWorkspaceInvitationCallSpy = vi.fn();

vi.mock('~/generated-metadata/graphql', () => ({
  useDeleteWorkspaceInvitationMutation: () => [
    mutationDeleteWorkspaceInvitationCallSpy,
  ],
}));

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useDeleteWorkspaceInvitation', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
