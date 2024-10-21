import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';

const mutationSendInvitationsCallSpy = jest.fn();

jest.mock('~/generated/graphql', () => ({
  useSendInvitationsMutation: () => [mutationSendInvitationsCallSpy],
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useCreateWorkspaceInvitation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Send invitations', async () => {
    const invitationParams = { emails: ['test@twenty.com'] };
    renderHook(
      () => {
        const { sendInvitation } = useCreateWorkspaceInvitation();
        sendInvitation(invitationParams);
      },
      { wrapper: Wrapper },
    );

    expect(mutationSendInvitationsCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: invitationParams,
    });
  });
});
