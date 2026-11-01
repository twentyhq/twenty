import { defineLogicFunction } from 'twenty-sdk/define';
import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';
export default defineLogicFunction({
 universalIdentifier: 'fccfc958-71db-43b6-9390-c28a055a5f7b', name: 'studio-mcp-publish-trainer-pay-rate', description: 'Опубликовать все четыре настраиваемые ступени оплаты тренера.', timeoutSeconds: 90,
 toolTriggerSettings: { inputSchema: STUDIO_TOOL_SCHEMAS.publishTrainerPayRate },
 handler: async (input: unknown, context: { userWorkspaceId: string | null; workspaceMemberId: string | null }) => runStudioTool('publishTrainerPayRate', input, undefined, undefined, context),
});
