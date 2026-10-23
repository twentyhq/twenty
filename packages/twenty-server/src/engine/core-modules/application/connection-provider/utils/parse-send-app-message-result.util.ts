import { type SendAppMessageResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

const sendAppMessageResultSchema = z.object({
  externalId: z.string().trim().min(1).max(512),
  sentAt: z.union([z.string(), z.number()]).nullish(),
});

type ParseSendAppMessageResultOutcome =
  | { isValid: true; sentMessage: SendAppMessageResult }
  | { isValid: false; reason: string };

// the message is already delivered, so an unreadable time falls back to now instead of failing the send
const toIsoDateOrUndefined = (
  value: string | number | null | undefined,
): string | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const parseSendAppMessageResult = (
  data: unknown,
): ParseSendAppMessageResultOutcome => {
  const parsed = sendAppMessageResultSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'result'}: ${issue.message}`)
        .join('; '),
    };
  }

  const { externalId } = parsed.data;
  const sentAt = toIsoDateOrUndefined(parsed.data.sentAt);

  return {
    isValid: true,
    sentMessage: isDefined(sentAt) ? { externalId, sentAt } : { externalId },
  };
};
