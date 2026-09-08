import { asRecord } from 'src/logic-functions/utils/as-record.util';

export const isDesktopAudioRecording = (session: unknown): boolean => {
  const record = asRecord(session);
  return record?.source === 'desktop' && record?.media === 'audio';
};
