import { isDefined } from 'twenty-shared/utils';

import { HARD_SUPPRESSION_REASONS } from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import { type EmailingDomainSendKind } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-kind.type';
import { type MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';

type IsSuppressionBlockingSendArgs = {
  sendKind: EmailingDomainSendKind;
  suppression: Pick<MessageSuppressionEntity, 'reason' | 'unsubscribeTopicId'>;
  unsubscribeTopicId?: string;
};

export const isSuppressionBlockingSend = ({
  sendKind,
  suppression,
  unsubscribeTopicId,
}: IsSuppressionBlockingSendArgs): boolean => {
  if (HARD_SUPPRESSION_REASONS.includes(suppression.reason)) {
    return true;
  }

  if (sendKind === 'TRANSACTIONAL') {
    return false;
  }

  if (!isDefined(suppression.unsubscribeTopicId)) {
    return true;
  }

  return suppression.unsubscribeTopicId === unsubscribeTopicId;
};
