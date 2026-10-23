import { type SendAppMessageResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

const sendAppMessageResultSchema = z.object({
  externalId: z.string().trim().min(1).max(512),
  sentAt: z.string().datetime({ offset: true }).nullish(),
});

type ParseSendAppMessageResultOutcome =
  | { isValid: true; sentMessage: SendAppMessageResult }
  | { isValid: false; reason: string };

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

  const { externalId, sentAt } = parsed.data;

  return {
    isValid: true,
    sentMessage: isDefined(sentAt) ? { externalId, sentAt } : { externalId },
  };
};
