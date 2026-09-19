import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadParticipantRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-participant-role.enum';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const OWNER_ID = 'owner-user-workspace-id';
const OTHER_ID = 'other-user-workspace-id';

// The participant table is filled by a slow command that runs after the fast
// one creates it, so the two states below are both real in a live deploy.
const buildService = ({
  ownerRows = [{ userWorkspaceId: OWNER_ID }],
  creatorUserWorkspaceId = OWNER_ID,
}: {
  ownerRows?: { userWorkspaceId: string }[];
  creatorUserWorkspaceId?: string | null;
} = {}) => {
  const participantRepository = {
    existsBy: jest
      .fn()
      .mockImplementation((_workspaceId, where) =>
        Promise.resolve(
          where.role === AgentChatThreadParticipantRole.OWNER &&
            ownerRows.some(
              (row) => row.userWorkspaceId === where.userWorkspaceId,
            ),
        ),
      ),
  };

  const threadRepository = {
    existsBy: jest
      .fn()
      .mockImplementation((_workspaceId, where) =>
        Promise.resolve(where.userWorkspaceId === creatorUserWorkspaceId),
      ),
  };

  const service = Object.create(AgentChatService.prototype) as AgentChatService;

  Object.assign(service, { participantRepository, threadRepository });

  return { service, participantRepository, threadRepository };
};

const assertOwner = (service: AgentChatService, userWorkspaceId: string) =>
  service.assertThreadOwner({
    threadId: THREAD_ID,
    userWorkspaceId,
    workspaceId: WORKSPACE_ID,
  });

describe('AgentChatService.assertThreadOwner', () => {
  it('lets the owner through on the owner row', async () => {
    const { service, threadRepository } = buildService();

    await expect(assertOwner(service, OWNER_ID)).resolves.toBeUndefined();
    expect(threadRepository.existsBy).not.toHaveBeenCalled();
  });

  it('falls back to the creator column while the backfill has not run', async () => {
    const { service } = buildService({ ownerRows: [] });

    await expect(assertOwner(service, OWNER_ID)).resolves.toBeUndefined();
  });

  it('still refuses somebody who is neither', async () => {
    const { service } = buildService({ ownerRows: [] });

    await expect(assertOwner(service, OTHER_ID)).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_ACTION_NOT_ALLOWED,
    });
  });

  it('refuses a participant who is not the owner', async () => {
    const { service } = buildService();

    await expect(assertOwner(service, OTHER_ID)).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_ACTION_NOT_ALLOWED,
    });
  });
});
