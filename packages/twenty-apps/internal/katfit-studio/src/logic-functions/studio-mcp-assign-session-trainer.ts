import { defineLogicFunction } from 'twenty-sdk/define';
import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';
export default defineLogicFunction({
 universalIdentifier: '25d24e18-49c3-4619-ae7a-873fe817d55d', name: 'studio-mcp-assign-session-trainer', description: 'Назначить одного активного тренера на незакрытое занятие. Закрытое начисление исправляется через сторно.', timeoutSeconds: 90,
 toolTriggerSettings: { inputSchema: STUDIO_TOOL_SCHEMAS.assignSessionTrainer },
 handler: async (input: unknown, context: { userWorkspaceId: string | null; workspaceMemberId: string | null }) => runStudioTool('assignSessionTrainer', input, undefined, undefined, context),
});
