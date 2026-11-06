import { type MessageDeliveryStatus } from 'twenty-shared/types';

export type ChatMessageDeliveryStatus = 'SENDING' | `${MessageDeliveryStatus}`;
