import { i18n } from '../../shared/i18n';

export class DesktopRecorderUnavailableError extends Error {
  constructor(readonly serverUrl: string) {
    super(
      i18n._(
        'Desktop Recorder is unavailable in this workspace. Install it to continue.',
      ),
    );
    this.name = 'DesktopRecorderUnavailableError';
  }
}
