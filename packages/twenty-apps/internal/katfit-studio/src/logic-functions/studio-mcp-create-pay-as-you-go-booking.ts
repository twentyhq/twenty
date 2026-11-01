import { defineLogicFunction } from 'twenty-sdk/define';

import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';

export default defineLogicFunction({
  universalIdentifier: '0bf4a6f5-574e-4e8b-97c3-92e9b14ce7ec',
  name: 'studio-mcp-create-pay-as-you-go-booking',
  description:
    'Добавить клиента с разовой услугой в существующую будущую тренировку и создать ожидаемую оплату EXPECTED. Это долг, не получение денег. Не использовать с заранее подготовленным session-payment для того же участника. Каждый завершившийся вызов фиксируется как MCP_COMMAND. Проверять result.success: внешний успех MCP означает только завершение функции. При неизвестном результате сверить CRM/журнал, не менять ключ и не повторять автоматически.',
  timeoutSeconds: 90,
  toolTriggerSettings: {
    inputSchema: STUDIO_TOOL_SCHEMAS.createPayAsYouGoBooking,
  },
  handler: async (
    input: unknown,
    context: {
      userWorkspaceId: string | null;
      workspaceMemberId: string | null;
    },
  ) =>
    runStudioTool(
      'createPayAsYouGoBooking',
      input,
      undefined,
      undefined,
      context,
    ),
});
