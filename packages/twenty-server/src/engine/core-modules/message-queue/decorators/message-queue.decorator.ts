import { Inject } from '@nestjs/common';

import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';

export const InjectMessageQueue = (queueName: MessageQueue) => {
  return Inject(getQueueToken(queueName));
};
