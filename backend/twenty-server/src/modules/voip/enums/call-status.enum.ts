import { registerEnumType } from '@nestjs/graphql';

export enum CallStatus {
  INITIATED = 'INITIATED',
  RINGING = 'RINGING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  TRANSFERRED = 'TRANSFERRED',
  COMPLETED = 'COMPLETED',
  NO_ANSWER = 'NO_ANSWER',
  BUSY = 'BUSY',
  FAILED = 'FAILED',
  VOICEMAIL = 'VOICEMAIL',
}

registerEnumType(CallStatus, {
  name: 'CallStatus',
  description: 'Call status',
});
