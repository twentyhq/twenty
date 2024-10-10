import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';

const mutationDeleteWorspaceInvitationCallSpy = jest.fn();

jest.mock('~/generated/graphql', () => ({
  useDeleteWorkspaceInvitationMutation: () => [
    mutationDeleteWorspaceInvitationCallSpy,
  ],
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

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

    expect(mutationDeleteWorspaceInvitationCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: params,
    });
  });
});
