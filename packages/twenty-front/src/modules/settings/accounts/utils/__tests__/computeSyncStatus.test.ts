import { CalendarChannelSyncStatus } from '@/accounts/types/CalendarChannel';
import { MessageChannelSyncStatus } from '@/accounts/types/MessageChannel';
import { SyncStatus } from '@/settings/accounts/enums/syncStatus.enum';
import { computeSyncStatus } from '../computeSyncStatus';

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

  test('should return NOT_SYNCED when message channel sync status is NOT_SYNCED', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.NOT_SYNCED,
        CalendarChannelSyncStatus.ACTIVE,
      ),
    ).toEqual(SyncStatus.NOT_SYNCED);
  });

  test('should return NOT_SYNCED when calendar channel sync status is NOT_SYNCED', () => {
    expect(
      computeSyncStatus(
        MessageChannelSyncStatus.ACTIVE,
        CalendarChannelSyncStatus.NOT_SYNCED,
      ),
    ).toEqual(SyncStatus.NOT_SYNCED);
  });
});
