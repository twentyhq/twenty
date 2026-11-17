import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';
import { resolveAgentRunStreamOwnerOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-stream-owner-or-throw.util';

export const resolveOwnAgentRunStreamChannelIdOrThrow = ({
  callerApplication,
  callerWorkspaceMemberId,
  runId,
}: {
  callerApplication: Pick<FlatApplication, 'id'> | null | undefined;
  callerWorkspaceMemberId: string | null;
  runId: string;
}): string =>
  buildAgentRunStreamChannelId({
    owner: resolveAgentRunStreamOwnerOrThrow({
      callerApplication,
      callerWorkspaceMemberId,
    }),
    runId,
  });
