import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { renderHook } from '@testing-library/react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationResendWorspaceInvitationCallSpy = jest.fn();

jest.mock('~/generated-metadata/graphql', () => ({
  useResendWorkspaceInvitationMutation: () => [
    mutationResendWorspaceInvitationCallSpy,
  ],
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useResendWorkspaceInvitation', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
