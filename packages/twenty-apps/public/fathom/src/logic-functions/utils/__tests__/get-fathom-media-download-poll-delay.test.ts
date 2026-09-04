import { describe, expect, it } from 'vitest';

import {
  FATHOM_MEDIA_DOWNLOAD_INITIAL_POLL_DELAY_MILLISECONDS,
  FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS,
  FATHOM_MEDIA_DOWNLOAD_MAX_POLL_DELAY_MILLISECONDS,
} from 'src/constants/fathom.constant';
import { getFathomMediaDownloadPollDelay } from 'src/logic-functions/utils/get-fathom-media-download-poll-delay.util';

describe('getFathomMediaDownloadPollDelay', () => {
  it('starts at the initial delay and grows with each attempt', () => {
    expect(getFathomMediaDownloadPollDelay(0)).toBe(
      FATHOM_MEDIA_DOWNLOAD_INITIAL_POLL_DELAY_MILLISECONDS,
    );
    expect(getFathomMediaDownloadPollDelay(1)).toBeGreaterThan(
      getFathomMediaDownloadPollDelay(0),
    );
    expect(getFathomMediaDownloadPollDelay(2)).toBeGreaterThan(
      getFathomMediaDownloadPollDelay(1),
    );
  });

  it('caps the delay so a stalled download keeps polling on a fixed cadence', () => {
    expect(
      getFathomMediaDownloadPollDelay(FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS),
    ).toBe(FATHOM_MEDIA_DOWNLOAD_MAX_POLL_DELAY_MILLISECONDS);
  });
});
