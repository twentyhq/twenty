import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { confirmGuardedPackagePayment } from 'src/logic-functions/handlers/confirm-guarded-membership-payment-handler';
import { type ConfirmPackagePaymentInput } from 'src/logic-functions/utils/package-payment';

const handler = async (
  routePayload: RoutePayload<ConfirmPackagePaymentInput>,
  context: { userWorkspaceId: string | null },
): Promise<Response> => {
  try {
    const result = await confirmGuardedPackagePayment(
      (routePayload.body ?? {}) as ConfirmPackagePaymentInput,
      context,
    );

    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  } catch {
    return new Response(
      {
        success: false,
        code: 'PACKAGE_PAYMENT_UNCONFIRMED',
        message:
          'Оплата, оформление пакета или журнал не подтверждены. Проверьте CRM и повторите запрос с прежним ключом.',
      },
      { status: 500 },
    );
  }
};

export default defineLogicFunction({
  universalIdentifier: '0f5807fe-5b0b-4cbe-8ba8-c4142148fb7e',
  name: 'studio-confirm-package-payment',
  description:
    'Confirm a package payment, create the client package and grant its visits',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/package-payments/confirm',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
