import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

const mutationSendInvitationsCallSpy = vi.fn();

vi.mock('~/generated-metadata/graphql', () => ({
  useSendInvitationsMutation: () => [mutationSendInvitationsCallSpy],
}));

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useCreateWorkspaceInvitation', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
