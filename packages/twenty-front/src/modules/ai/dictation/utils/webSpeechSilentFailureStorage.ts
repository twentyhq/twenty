const WEB_SPEECH_SILENT_FAILURE_KEY = 'twenty:dictation:web-speech-silent';

// Remembered per browser because the failure is a property of this WebView, not
// of the workspace or the user: once the engine has proven it accepts start()
// and then says nothing, offering the button again only costs another recording.
export const readWebSpeechSilentFailure = (): boolean => {
  try {
    return localStorage.getItem(WEB_SPEECH_SILENT_FAILURE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const recordWebSpeechSilentFailure = (): void => {
  try {
    localStorage.setItem(WEB_SPEECH_SILENT_FAILURE_KEY, 'true');
  } catch {
    return;
  }
};
