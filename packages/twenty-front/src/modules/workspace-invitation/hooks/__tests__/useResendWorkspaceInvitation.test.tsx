import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';

const mutationResendWorspaceInvitationCallSpy = jest.fn();

jest.mock('~/generated/graphql', () => ({
  useResendWorkspaceInvitationMutation: () => [
    mutationResendWorspaceInvitationCallSpy,
  ],
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

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
