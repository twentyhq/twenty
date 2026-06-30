type RecallBotVideoFrame = {
  kind: 'jpeg';
  b64_data: string;
};

export type RecallBotAutomaticVideoOutput = {
  in_call_recording: RecallBotVideoFrame;
  in_call_not_recording: RecallBotVideoFrame;
};
