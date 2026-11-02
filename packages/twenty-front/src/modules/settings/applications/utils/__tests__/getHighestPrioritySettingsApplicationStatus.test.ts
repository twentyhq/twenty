import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { getHighestPrioritySettingsApplicationStatus } from '@/settings/applications/utils/getHighestPrioritySettingsApplicationStatus';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

describe('getHighestPrioritySettingsApplicationStatus', () => {
  it('returns undefined when there is no status', () => {
    expect(getHighestPrioritySettingsApplicationStatus([])).toBeUndefined();
  });

  it('shows missing configuration over an available update', () => {
    expect(
      getHighestPrioritySettingsApplicationStatus([
        { type: 'updateAvailable' },
        { type: 'missingConfiguration' },
      ]),
    ).toEqual({ type: 'missingConfiguration' });
  });

  it('shows reconnect needed over missing configuration', () => {
    expect(
      getHighestPrioritySettingsApplicationStatus([
        { type: 'missingConfiguration' },
        { type: 'reconnectNeeded' },
      ]),
    ).toEqual({ type: 'reconnectNeeded' });
  });

  it('shows not connected over an available update', () => {
    expect(
      getHighestPrioritySettingsApplicationStatus([
        { type: 'updateAvailable' },
        { type: 'notConnected' },
      ]),
    ).toEqual({ type: 'notConnected' });
  });

  it('ranks every status from most to least urgent', () => {
    let remainingStatuses: Pick<SettingsApplicationStatus, 'type'>[] = [
      { type: 'notConnected' },
      { type: 'updateAvailable' },
      { type: 'accountSyncIssue' },
      { type: 'missingConfiguration' },
      { type: 'reconnectNeeded' },
    ];
    const pickedStatusTypes: SettingsApplicationStatus['type'][] = [];

    while (isNonEmptyArray(remainingStatuses)) {
      const pickedStatus =
        getHighestPrioritySettingsApplicationStatus(remainingStatuses);

      if (!isDefined(pickedStatus)) {
        break;
      }

      pickedStatusTypes.push(pickedStatus.type);
      remainingStatuses = remainingStatuses.filter(
        (status) => status !== pickedStatus,
      );
    }

    expect(pickedStatusTypes).toEqual([
      'reconnectNeeded',
      'accountSyncIssue',
      'missingConfiguration',
      'notConnected',
      'updateAvailable',
    ]);
  });

  it('does not reorder the given statuses', () => {
    const statuses = [
      { type: 'updateAvailable' as const },
      { type: 'missingConfiguration' as const },
    ];

    getHighestPrioritySettingsApplicationStatus(statuses);

    expect(statuses).toEqual([
      { type: 'updateAvailable' },
      { type: 'missingConfiguration' },
    ]);
  });
});
