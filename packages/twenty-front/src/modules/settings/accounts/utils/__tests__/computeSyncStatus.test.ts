import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
} from 'twenty-shared/types';

describe('computeSyncStatus', () => {
  test('should return PENDING_CONFIGURATION when message channel sync stage is PENDING_CONFIGURATION', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
          syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.PENDING_CONFIGURATION);
  });

  test('should return PENDING_CONFIGURATION when calendar channel sync stage is PENDING_CONFIGURATION', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
          syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
        },
      ),
    ).toEqual(SyncStatus.PENDING_CONFIGURATION);
  });

  test('should return PENDING_CONFIGURATION even when sync status is ACTIVE', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.PENDING_CONFIGURATION);
  });

  test('should return FAILED when both sync statuses are FAILED', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
          syncStage: MessageChannelSyncStage.FAILED,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
          syncStage: CalendarChannelSyncStage.FAILED,
        },
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when message channel sync status is FAILED_UNKNOWN', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
          syncStage: MessageChannelSyncStage.FAILED,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when message channel sync status is FAILED_INSUFFICIENT_PERMISSIONS', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
          syncStage: MessageChannelSyncStage.FAILED,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when calendar channel sync status is FAILED_UNKNOWN', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
          syncStage: CalendarChannelSyncStage.FAILED,
        },
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return FAILED when calendar channel sync status is FAILED_INSUFFICIENT_PERMISSIONS', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
          syncStage: CalendarChannelSyncStage.FAILED,
        },
      ),
    ).toEqual(SyncStatus.FAILED);
  });

  test('should return IMPORTING when message channel sync status is ONGOING', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.ONGOING,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
          type: MessageChannelType.EMAIL,
        },

        {
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.IMPORTING);
  });

  test('should return IMPORTING when calendar channel sync status is ONGOING', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.ONGOING,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        },
      ),
    ).toEqual(SyncStatus.IMPORTING);
  });

  test('should return NOT_SYNCED when both channels are NOT_SYNCED', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.NOT_SYNCED);
  });

  test('should return SYNCED when message channel is ACTIVE and calendar is NOT_SYNCED', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.SYNCED);
  });

  test('should return SYNCED when calendar channel is ACTIVE and message is NOT_SYNCED', () => {
    expect(
      computeSyncStatus(
        {
          syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          type: MessageChannelType.EMAIL,
        },
        {
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
      ),
    ).toEqual(SyncStatus.SYNCED);
  });

  test('should return NOT_SYNCED when channels are empty', () => {});
});
