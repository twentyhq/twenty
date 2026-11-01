import { defineLogicFunction } from 'twenty-sdk/define';

import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';

export default defineLogicFunction({
  universalIdentifier: '5b6bdea5-2264-454c-9cb5-d34de8737efa',
  name: 'studio-mcp-create-regular-booking',
  description:
    'Добавить клиента по выбранному пакету в существующую будущую тренировку через штатную команду с проверками пакета, баланса, дублей и вместимости. Резервирует посещение, не фиксирует оплату или посещение; не для сплита. Каждый завершившийся вызов фиксируется как MCP_COMMAND. Проверять result.success: внешний успех MCP означает только завершение функции. При неизвестном результате сверить CRM/журнал, не менять ключ и не повторять автоматически.',
  timeoutSeconds: 90,
  toolTriggerSettings: {
    inputSchema: STUDIO_TOOL_SCHEMAS.createRegularBooking,
  },
  handler: async (
    input: unknown,
    context: {
      userWorkspaceId: string | null;
      workspaceMemberId: string | null;
    },
  ) =>
    runStudioTool('createRegularBooking', input, undefined, undefined, context),
});
