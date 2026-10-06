import { type PendingWakeUpOwnerType } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-type.type';

// key tells apart the wake-ups one owner holds at once, like the steps of a workflow run
export type PendingWakeUpOwner = {
  type: PendingWakeUpOwnerType;
  id: string;
  key: string;
};
