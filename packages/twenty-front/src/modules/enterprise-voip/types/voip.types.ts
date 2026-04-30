export type CallDirection = 'inbound' | 'outbound';

export type CallStatus = 'completed' | 'missed' | 'voicemail' | 'busy' | 'failed';

export type CallRecord = {
  id: string;
  direction: CallDirection;
  status: CallStatus;
  callerName: string;
  callerNumber: string;
  agentName: string;
  duration: number;
  startedAt: string;
  recordingUrl?: string;
};

export type ActiveCallData = {
  id: string;
  agentName: string;
  callerName: string;
  callerNumber: string;
  direction: CallDirection;
  startedAt: string;
  elapsedSeconds: number;
  queue: string;
};

export type DialerCampaignData = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  totalContacts: number;
  contacted: number;
  connected: number;
  connectRate: number;
  avgCallDuration: number;
  startDate: string;
};
