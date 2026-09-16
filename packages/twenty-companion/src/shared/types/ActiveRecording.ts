export type ActiveRecording = {
  id: string;
  windowId: string;
  title: string;
  startedAt: string;
  status:
    | 'starting'
    | 'recording'
    | 'pausing'
    | 'paused'
    | 'resuming'
    | 'stopping';
  pausedAt?: string;
  pausedMilliseconds?: number;
};
