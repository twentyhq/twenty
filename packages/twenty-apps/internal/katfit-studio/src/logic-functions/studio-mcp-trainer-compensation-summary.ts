import { defineLogicFunction } from 'twenty-sdk/define';
import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';
export default defineLogicFunction({
 universalIdentifier: '1c115cd7-1c19-48da-8879-3b5f67f564b0', name: 'studio-mcp-trainer-compensation-summary', description: 'Рассчитать зарплату тренера за период по сохранённым начислениям. Границы: startsAt включительно, endsAt не включается. Фактические выплаты не учитываются.', timeoutSeconds: 90,
 toolTriggerSettings: { inputSchema: STUDIO_TOOL_SCHEMAS.trainerCompensationSummary },
 handler: async (input: unknown, context: { userWorkspaceId: string | null; workspaceMemberId: string | null }) => runStudioTool('trainerCompensationSummary', input, undefined, undefined, context),
});
