import { defineLogicFunction } from 'twenty-sdk/define';

import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';

export default defineLogicFunction({
  universalIdentifier: '8c941e47-aec0-4e73-9be8-90d63e32f960',
  name: 'studio-mcp-create-class-session',
  description:
    'Создать тренировку с участниками через штатную команду KATFIT. По пакету: будущая запись резервирует посещение, прошедшая списывает. До вызова проверить оплату пакета и пересечения; ACTIVE не доказывает PAID. Для прошедшей нужны pastConfirmed и attendanceReason. Сплит и участники текущей тренировки недоступны. Каждый завершившийся вызов фиксируется как MCP_COMMAND. Проверять result.success: внешний успех MCP означает только завершение функции. При неизвестном результате сверить CRM/журнал, не менять ключ и не повторять автоматически.',
  timeoutSeconds: 90,
  toolTriggerSettings: {
    inputSchema: STUDIO_TOOL_SCHEMAS.createSession,
  },
  handler: async (
    input: unknown,
    context: {
      userWorkspaceId: string | null;
      workspaceMemberId: string | null;
    },
  ) => runStudioTool('createSession', input, undefined, undefined, context),
});
