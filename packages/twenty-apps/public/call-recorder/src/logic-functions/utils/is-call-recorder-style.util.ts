import { CALL_RECORDER_STYLES } from 'src/logic-functions/constants/call-recorder-styles';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';

export const isCallRecorderStyle = (
  value: string | undefined,
): value is CallRecorderStyle =>
  CALL_RECORDER_STYLES.some((style) => style === value);
