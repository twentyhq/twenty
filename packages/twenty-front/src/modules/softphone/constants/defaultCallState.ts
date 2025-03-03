import { CallState } from "../types/callState";
import { CallStatus } from "../types/callStatusEnum";

const defaultCallState : CallState = {
  isRegistered: false,
  isRegistering: false,
  isInCall: false,
  isMuted: false,
  isOnHold: false,
  currentNumber: '',
  incomingCall: false,
  incomingCallNumber: '',
  callStatus: CallStatus.NONE,
  callStartTime: null,
  ringingStartTime: null
}

export default defaultCallState;