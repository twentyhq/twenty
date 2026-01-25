import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

const mutationResendWorspaceInvitationCallSpy = vi.fn();

vi.mock('~/generated-metadata/graphql', () => ({
  useResendWorkspaceInvitationMutation: () => [
    mutationResendWorspaceInvitationCallSpy,
  ],
}));

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useResendWorkspaceInvitation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Resend Workspace Invitation', async () => {
    const params = { appTokenId: 'test' };
    renderHook(
      () => {
        const { resendInvitation } = useResendWorkspaceInvitation();
        resendInvitation(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationResendWorspaceInvitationCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: params,
    });
  });
});
