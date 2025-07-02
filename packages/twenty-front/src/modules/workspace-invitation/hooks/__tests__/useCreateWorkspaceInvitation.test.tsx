import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { renderHook } from '@testing-library/react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mutationSendInvitationsCallSpy = jest.fn();

jest.mock('~/generated-metadata/graphql', () => ({
  useSendInvitationsMutation: () => [mutationSendInvitationsCallSpy],
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useCreateWorkspaceInvitation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Send invitations', async () => {
    const params = { emails: ['test@test.com'] };
    renderHook(
      () => {
        const { sendInvitation } = useCreateWorkspaceInvitation();
        sendInvitation(params);
      },
      { wrapper: Wrapper },
    );

    expect(mutationSendInvitationsCallSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: params,
    });
  });
});
