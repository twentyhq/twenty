import { isDefined } from 'twenty-shared/utils';

import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { HARD_SUPPRESSION_REASONS } from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import { type EmailingDomainSendKind } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-kind.type';
import { type MessageSuppressionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-suppression.workspace-entity';

type IsSuppressionBlockingSendArgs = {
  sendKind: EmailingDomainSendKind;
  suppression: Pick<
    MessageSuppressionWorkspaceEntity,
    'reason' | 'unsubscribeTopicId'
  >;
  unsubscribeTopicId?: string;
};

export const isSuppressionBlockingSend = ({
  sendKind,
  suppression,
  unsubscribeTopicId,
}: IsSuppressionBlockingSendArgs): boolean => {
  if (suppression.reason === MessageSuppressionReason.TRACKING) {
    return false;
  }

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
