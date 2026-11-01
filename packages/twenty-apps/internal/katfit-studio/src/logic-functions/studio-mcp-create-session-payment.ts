import { defineLogicFunction } from 'twenty-sdk/define';

import { runStudioTool } from 'src/logic-functions/utils/run-studio-tool';
import { STUDIO_TOOL_SCHEMAS } from 'src/logic-functions/utils/studio-tool-input';

export default defineLogicFunction({
  universalIdentifier: '154cc601-0b8d-4530-8650-da4dabaccd3f',
  name: 'studio-mcp-create-session-payment',
  description:
    'Создать разовую оплату перед тренировкой: PLANNED создаёт долг EXPECTED, COMPLETED — PAID только после подтверждения получения денег paymentReceivedConfirmed=true. Оплата сохраняется сразу, даже если тренировка затем не создана. Не совмещать с отдельной pay-as-you-go бронью. Каждый завершившийся вызов фиксируется как MCP_COMMAND. Проверять result.success: внешний успех MCP означает только завершение функции. При неизвестном результате сверить CRM/журнал, не менять ключ и не повторять автоматически.',
  timeoutSeconds: 90,
  toolTriggerSettings: {
    inputSchema: STUDIO_TOOL_SCHEMAS.createSessionPayment,
  },
  handler: async (
    input: unknown,
    context: {
      userWorkspaceId: string | null;
      workspaceMemberId: string | null;
    },
  ) =>
    runStudioTool('createSessionPayment', input, undefined, undefined, context),
});
