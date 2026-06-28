// Recall's automatic_video_output config. Each state renders a static JPEG frame
// on the bot's camera; we set both so the logo shows for the whole call.
type RecallBotVideoFrame = {
  kind: 'jpeg';
  b64_data: string;
};

export type RecallBotAutomaticVideoOutput = {
  in_call_recording: RecallBotVideoFrame;
  in_call_not_recording: RecallBotVideoFrame;
};
