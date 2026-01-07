import { CalendarChannelSyncStatus } from '@/accounts/types/CalendarChannel';
import { MessageChannelSyncStatus } from '@/accounts/types/MessageChannel';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';

describe('computeSyncStatus', () => {
  test('should return FAILED when both sync statuses are FAILED', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.FAILED_UNKNOWN,
        CalendarChannelSyncStatus.FAILED_UNKNOWN,
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when message channel sync status is FAILED_UNKNOWN', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.FAILED_UNKNOWN,
        CalendarChannelSyncStatus.ACTIVE,
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when message channel sync status is FAILED_INSUFFICIENT_PERMISSIONS', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
        CalendarChannelSyncStatus.ACTIVE,
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when calendar channel sync status is FAILED_UNKNOWN', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.ACTIVE,
        CalendarChannelSyncStatus.FAILED_UNKNOWN,
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when calendar channel sync status is FAILED_INSUFFICIENT_PERMISSIONS', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.ACTIVE,
        CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return IMPORTING when message channel sync status is ONGOING', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.ONGOING,
        CalendarChannelSyncStatus.ACTIVE,
      ),
    ).toEqual(SyncStatus.IMPORTING);
  });

  test('should return IMPORTING when calendar channel sync status is ONGOING', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.ACTIVE,
        CalendarChannelSyncStatus.ONGOING,
      ),
    ).toEqual(SyncStatus.IMPORTING);
  });

  test('should return SYNCED when one channel is ACTIVE and the other is NOT_SYNCED', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.NOT_SYNCED,
        CalendarChannelSyncStatus.ACTIVE,
      ),
    ).toEqual(SyncStatus.SYNCED);
  });

  test('should return SYNCED when one channel is ACTIVE and the other is NOT_SYNCED', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.ACTIVE,
        CalendarChannelSyncStatus.NOT_SYNCED,
      ),
    ).toEqual(SyncStatus.SYNCED);
  });
});
