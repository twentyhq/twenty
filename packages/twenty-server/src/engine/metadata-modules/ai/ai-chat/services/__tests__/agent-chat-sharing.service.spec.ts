import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';

const PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier;
const RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.lastResolvedMentionAt
    .universalIdentifier;

const buildService = ({
  isMentionResolutionReady,
}: {
  isMentionResolutionReady: boolean;
}) =>
  new AgentChatSharingService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [PARTICIPANT_OBJECT_UNIVERSAL_IDENTIFIER]: { id: 'participants' },
          },
        },
        flatFieldMetadataMaps: {
          byUniversalIdentifier: isMentionResolutionReady
            ? { [RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER]: {} }
            : {},
        },
      }),
    } as never,
    {} as never,
    {} as never,
    {} as never,
  );

describe('AgentChatSharingService participant readiness', () => {
  it('fences participant access until mention resolution metadata is provisioned', async () => {
    const service = buildService({ isMentionResolutionReady: false });

    await expect(
      service.getParticipantObjectMetadataId('workspace-id'),
    ).rejects.toMatchObject({ code: 'WORKSPACE_UPGRADE_REQUIRED' });
  });

  it('allows participant access once mention resolution metadata is provisioned', async () => {
    const service = buildService({ isMentionResolutionReady: true });

    await expect(
      service.getParticipantObjectMetadataId('workspace-id'),
    ).resolves.toBe('participants');
  });
});
