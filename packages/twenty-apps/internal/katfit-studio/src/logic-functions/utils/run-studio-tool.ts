import { isObject, isString } from '@sniptt/guards';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';

import {
  type StudioToolCommand,
  validateStudioToolInput,
} from 'src/logic-functions/utils/studio-tool-input';

import {
  appendStudioCommandAudit,
  type StudioCommandAudit,
  type StudioAuditActor,
} from 'src/logic-functions/utils/studio-command-audit';

type StudioToolResult = Record<string, unknown> & { success: boolean };
type CommandTransport = Pick<RestApiClient, 'post'>;

const STUDIO_COMMANDS: Record<
  StudioToolCommand,
  { path: string; identifier?: string }
> = {
  publishTrainerPayRate: { path: '/s/studio/compensation/publish-rate' },
  assignSessionTrainer: { path: '/s/studio/sessions/assign-trainer' },
  closeTrainerCompensation: { path: '/s/studio/compensation/close' },
  trainerCompensationSummary: { path: '/s/studio/compensation/summary' },
  createSession: {
    path: '/s/studio/sessions/create',
    identifier: 'classSessionId',
  },
  createSessionPayment: {
    path: '/s/studio/sessions/payment',
    identifier: 'paymentId',
  },
  createRegularBooking: {
    path: '/s/studio/bookings/create',
    identifier: 'bookingId',
  },
  createPayAsYouGoBooking: {
    path: '/s/studio/bookings/create-pay-as-you-go',
    identifier: 'bookingId',
  },
};
const isDomainResult = (value: unknown): value is StudioToolResult =>
  isObject<Record<string, unknown>, unknown>(value) &&
  typeof value.success === 'boolean';

const unconfirmed = (): StudioToolResult => ({
  success: false,
  code: 'STUDIO_TOOL_RESULT_UNCONFIRMED',
  message:
    'Результат операции не подтверждён. Данные могли сохраниться. Проверьте CRM и журнал; не создавайте новый ключ, не повторяйте неизвестную операцию и не используйте CRUD.',
});

export const runStudioTool = async (
  command: StudioToolCommand,
  input: unknown,
  transport: CommandTransport = new RestApiClient(),
  audit: (
    event: StudioCommandAudit,
  ) => Promise<boolean> = appendStudioCommandAudit,
  actor?: StudioAuditActor,
): Promise<StudioToolResult> => {
  const finish = async (
    result: StudioToolResult,
  ): Promise<StudioToolResult> => {
    if (
      await audit({ command, input, result, eventType: 'MCP_COMMAND', actor })
    )
      return result;
    return {
      success: false,
      code: 'STUDIO_TOOL_AUDIT_UNCONFIRMED',
      message:
        'Журнал MCP-команды не подтверждён. Данные могли сохраниться; сверьте исходный результат без автоматического повтора.',
      operationResult: result,
    };
  };
  const validated = validateStudioToolInput(command, input);
  if (!validated.success)
    return finish({
      success: false,
      code: 'STUDIO_TOOL_INVALID_INPUT',
      message: validated.message,
    });
  const body = { ...validated.input };
  delete body.paymentReceivedConfirmed;
  const target = STUDIO_COMMANDS[command];
  try {
    // Reuse installed domain routes so tools and UI execute the same booking/payment rules.
    const result = await transport.post<unknown>(target.path, body, {
      signal: AbortSignal.timeout(60_000),
    });
    if (!isDomainResult(result)) return finish(unconfirmed());
    if (
      result.success && target.identifier &&
      (!isString(result[target.identifier]) || !result[target.identifier])
    )
      return finish(unconfirmed());
    return finish(result);
  } catch (error) {
    if (
      error instanceof RestApiClientError &&
      isDomainResult(error.body) &&
      error.body.success === false
    ) {
      return finish({ ...error.body, status: error.status });
    }
    return finish(unconfirmed());
  }
};
