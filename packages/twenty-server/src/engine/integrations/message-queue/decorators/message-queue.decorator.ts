import { Inject } from '@nestjs/common';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

export const InjectMessageQueue = (messageQueueName: MessageQueue) => {
  return Inject(messageQueueName);
};
