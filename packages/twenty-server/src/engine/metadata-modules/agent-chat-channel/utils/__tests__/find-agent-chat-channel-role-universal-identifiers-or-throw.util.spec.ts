import { findAgentChatChannelRoleUniversalIdentifiersOrThrow } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-agent-chat-channel-role-universal-identifiers-or-throw.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const ADMIN_ROLE_ID = '20202020-0000-4000-8000-000000000001';
const MEMBER_ROLE_ID = '20202020-0000-4000-8000-000000000002';
const ADMIN_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000011';
const MEMBER_ROLE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000012';

const FLAT_ROLE_MAPS = {
  universalIdentifierById: {
    [ADMIN_ROLE_ID]: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
    [MEMBER_ROLE_ID]: MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
  },
};

describe('findAgentChatChannelRoleUniversalIdentifiersOrThrow', () => {
  it('returns the universal identifier of each role once', () => {
    expect(
      findAgentChatChannelRoleUniversalIdentifiersOrThrow({
        flatRoleMaps: FLAT_ROLE_MAPS,
        roleIds: [ADMIN_ROLE_ID, MEMBER_ROLE_ID, ADMIN_ROLE_ID],
      }),
    ).toEqual([
      ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
      MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
    ]);
  });

  it('refuses a role from outside the workspace', () => {
    expect(() =>
      findAgentChatChannelRoleUniversalIdentifiersOrThrow({
        flatRoleMaps: FLAT_ROLE_MAPS,
        roleIds: [ADMIN_ROLE_ID, '20202020-0000-4000-8000-000000000099'],
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.INVALID_CHAT_CHANNEL_ROLE,
      }),
    );
  });
});
