import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS } from 'src/constants/granola-history.constant';
import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';
import { enqueueGranolaNoteDiscoveryOrThrow } from 'src/logic-functions/utils/enqueue-granola-note-discovery-or-throw.util';

vi.mock('src/logic-functions/utils/enqueue-granola-job-or-throw.util');

beforeEach(() => vi.clearAllMocks());

describe('enqueueGranolaNoteDiscoveryOrThrow', () => {
  it('does not enqueue a workspace-wide job for an empty folder list', async () => {
    await expect(
      enqueueGranolaNoteDiscoveryOrThrow({
        registrationId: 'registration',
        discoveryFolderIds: [],
      }),
    ).resolves.toEqual({ enqueuedDiscoveryCount: 0 });

    expect(enqueueGranolaJobOrThrow).not.toHaveBeenCalled();
  });

  it('schedules one paced job per selected folder', async () => {
    await expect(
      enqueueGranolaNoteDiscoveryOrThrow({
        registrationId: 'registration',
        updatedAfter: '2026-11-18T00:00:00.000Z',
        discoveryFolderIds: ['fol_first', 'fol_second', 'fol_first'],
      }),
    ).resolves.toEqual({ enqueuedDiscoveryCount: 2 });

    expect(enqueueGranolaJobOrThrow).toHaveBeenCalledTimes(2);
    expect(enqueueGranolaJobOrThrow).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        payload: expect.objectContaining({
          registrationId: 'registration',
          folderId: 'fol_first',
          updatedAfter: '2026-11-18T00:00:00.000Z',
        }),
        delayMs: 0,
      }),
    );
    expect(enqueueGranolaJobOrThrow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        payload: expect.objectContaining({ folderId: 'fol_second' }),
        delayMs: GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS,
      }),
    );
  });
});
