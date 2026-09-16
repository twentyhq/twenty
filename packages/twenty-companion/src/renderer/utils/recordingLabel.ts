import { i18n } from '@lingui/core';

export const recordingLabel = (status: string) =>
  ({
    COMPLETED: i18n._('Saved to Twenty'),
    PROCESSING: i18n._('Processing'),
    FAILED: i18n._('Recording failed'),
    RECORDING: i18n._('Recording'),
    PENDING: i18n._('Preparing'),
  })[status] ?? i18n._('Preparing');
