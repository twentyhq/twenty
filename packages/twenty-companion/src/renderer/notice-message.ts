import { i18n } from '@lingui/core';
import { type CompanionNotice } from '../shared/types';

export const noticeMessage = (notice: CompanionNotice): string => {
  switch (notice.type) {
    case 'preview':
      return notice.message;
    case 'opening-meeting':
      return i18n._(
        'Opening {title}. Complete any meeting provider confirmation to enter.',
        { title: notice.title },
      );
    case 'recording-finished':
      return i18n._('Recording ended. Twenty is processing your conversation.');
    case 'network-lost':
      return i18n._(
        'Network connection lost. Stopping this recording. Reconnect before starting a new recording.',
      );
    case 'network-restored-active':
      return i18n._(
        'Connection restored. Finish the interrupted recording before starting another.',
      );
    case 'network-restored':
      return i18n._(
        'Connection restored. Start a new recording to continue capturing.',
      );
    case 'audio-interrupted':
      return i18n._(
        'Audio capture was interrupted. Check your microphone and speaker settings.',
      );
    case 'recording-stopped-offline':
      return i18n._(
        'Recording stopped after the connection was lost. Reconnect to check its processing status.',
      );
  }
};
