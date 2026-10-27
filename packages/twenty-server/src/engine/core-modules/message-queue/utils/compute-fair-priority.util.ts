import { PRIORITY_LIMIT } from 'bullmq';

import { FAIR_TICKET_OFFSET } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';

export const computeFairPriority = ({ tag }: { tag: number }): number =>
  FAIR_TICKET_OFFSET +
  Math.min(PRIORITY_LIMIT - FAIR_TICKET_OFFSET, Math.max(0, Math.floor(tag)));
