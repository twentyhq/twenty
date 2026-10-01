import { getAgentChatThreadMembers } from '@/ai/utils/getAgentChatThreadMembers';

const OWNER = { id: 'owner' };
const TIM = { id: 'tim' };
const JANE = { id: 'jane' };

describe('getAgentChatThreadMembers', () => {
  it('shows the owner before the preview loads', () => {
    expect(
      getAgentChatThreadMembers({
        ownerWorkspaceMemberId: OWNER.id,
        memberIds: [],
        workspaceMembers: [JANE, OWNER, TIM],
      }),
    ).toEqual([OWNER]);
  });

  it('keeps the owner first once the other members are known', () => {
    expect(
      getAgentChatThreadMembers({
        ownerWorkspaceMemberId: OWNER.id,
        memberIds: [TIM.id, OWNER.id],
        workspaceMembers: [JANE, OWNER, TIM],
      }),
    ).toEqual([OWNER, TIM]);
  });

  it('leaves out members no longer in the workspace', () => {
    expect(
      getAgentChatThreadMembers({
        ownerWorkspaceMemberId: null,
        memberIds: ['former-member', JANE.id],
        workspaceMembers: [JANE, OWNER, TIM],
      }),
    ).toEqual([JANE]);
  });
});
