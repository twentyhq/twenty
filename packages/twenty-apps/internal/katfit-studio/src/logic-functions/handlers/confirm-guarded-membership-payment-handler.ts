import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  confirmPackagePayment,
  type ConfirmPackagePaymentResult,
} from 'src/logic-functions/handlers/confirm-package-payment-handler';
import {
  confirmSplitPayment,
  type ConfirmSplitPaymentResult,
} from 'src/logic-functions/handlers/confirm-split-payment-handler';
import { type ConfirmPackagePaymentInput } from 'src/logic-functions/utils/package-payment';
import { type ConfirmSplitPaymentInput } from 'src/logic-functions/utils/split-payment';
import { runMembershipPurchase } from 'src/logic-functions/utils/run-membership-purchase';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

const isRecord = isObject<Record<string, unknown>, unknown>;
const isBalance = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;
export const confirmGuardedPackagePayment = async (
  input: ConfirmPackagePaymentInput,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
  execute: typeof confirmPackagePayment = confirmPackagePayment,
): Promise<ConfirmPackagePaymentResult> =>
  execute(input, context, client, async (membershipId, normalized) =>
    runMembershipPurchase({
      membershipId,
      request: JSON.stringify({ kind: 'PACKAGE', input: normalized }),
      client,
      execute: (businessClient) => execute(normalized, context, businessClient),
      decodeSuccess: (
        value,
      ): Extract<ConfirmPackagePaymentResult, { success: true }> | null =>
        isRecord(value) &&
        value.success === true &&
        typeof value.duplicate === 'boolean' &&
        value.membershipId === membershipId &&
        isStudioRecordIdentifier(value.paymentId) &&
        isStudioRecordIdentifier(value.transactionId) &&
        isBalance(value.visitsAvailable)
          ? {
              success: true,
              duplicate: value.duplicate,
              membershipId,
              paymentId: value.paymentId,
              transactionId: value.transactionId,
              visitsAvailable: value.visitsAvailable,
            }
          : null,
    }),
  );
export const confirmGuardedSplitPayment = async (
  input: ConfirmSplitPaymentInput,
  client = new CoreApiClient(),
  execute: typeof confirmSplitPayment = confirmSplitPayment,
): Promise<ConfirmSplitPaymentResult> =>
  execute(input, client, async (membershipId, normalized) =>
    runMembershipPurchase({
      membershipId,
      request: JSON.stringify({ kind: 'SPLIT', input: normalized }),
      client,
      execute: (businessClient) => execute(normalized, businessClient),
      decodeSuccess: (
        value,
      ): Extract<ConfirmSplitPaymentResult, { success: true }> | null =>
        isRecord(value) &&
        value.success === true &&
        typeof value.duplicate === 'boolean' &&
        value.membershipId === membershipId &&
        Array.isArray(value.paymentIds) &&
        value.paymentIds.length >= 1 &&
        value.paymentIds.length <= 2 &&
        value.paymentIds.every(isStudioRecordIdentifier) &&
        new Set(value.paymentIds).size === value.paymentIds.length &&
        isBalance(value.visitsAvailable)
          ? {
              success: true,
              duplicate: value.duplicate,
              membershipId,
              paymentIds: [...value.paymentIds],
              visitsAvailable: value.visitsAvailable,
            }
          : null,
    }),
  );
