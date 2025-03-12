import { CallStatus } from './callStatusEnum';

export interface CallState {
  isRegistered: boolean;
  isRegistering: boolean;
  isInCall: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  currentNumber: string;
  incomingCall: boolean;
  incomingCallNumber: string;
  callStatus: CallStatus;
  callStartTime: number | null;
  ringingStartTime: number | null;
}
