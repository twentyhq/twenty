import { defineLogicFunction } from 'twenty-sdk/define';
import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';
export default defineLogicFunction({
 universalIdentifier: '064d9818-371e-41bb-abba-6c8e302b029f', name: 'studio-mcp-close-trainer-compensation', description: 'Рассчитать и начислить оплату за проведённое занятие. Сначала previewOnly=true, затем подтверждение с тем же requestKey и previewToken. Для исправления указать previousEntryId и причину. Считать только фактически пришедших. При неизвестном результате сверить журнал, не менять ключ.', timeoutSeconds: 90,
 toolTriggerSettings: { inputSchema: STUDIO_TOOL_SCHEMAS.closeTrainerCompensation },
 handler: async (input: unknown, context: { userWorkspaceId: string | null; workspaceMemberId: string | null }) => runStudioTool('closeTrainerCompensation', input, undefined, undefined, context),
});
