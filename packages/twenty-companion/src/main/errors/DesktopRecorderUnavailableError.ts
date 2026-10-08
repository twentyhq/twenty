export class DesktopRecorderUnavailableError extends Error {
  constructor(readonly serverUrl: string) {
    super(
      'Desktop Recorder is unavailable in this workspace. Install it to continue.',
    );
    this.name = 'DesktopRecorderUnavailableError';
  }
}
