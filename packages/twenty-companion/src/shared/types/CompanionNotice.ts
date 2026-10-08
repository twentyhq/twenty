export type CompanionNotice =
  | { type: 'preview'; message: string }
  | { type: 'opening-meeting'; title: string }
  | {
      type:
        | 'recording-finished'
        | 'network-lost'
        | 'network-restored-active'
        | 'network-restored'
        | 'audio-interrupted'
        | 'recording-stopped-offline';
    };
