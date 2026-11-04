import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';

export type PrebuiltCallRecorderStyle = Extract<
  CallRecorderStyle,
  'TWENTY' | 'MINIMAL'
>;
