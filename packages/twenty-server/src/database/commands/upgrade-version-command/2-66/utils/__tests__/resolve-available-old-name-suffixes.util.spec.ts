import { resolveAvailableOldNameSuffixes } from 'src/database/commands/upgrade-version-command/2-66/utils/resolve-available-old-name-suffixes.util';

describe('resolveAvailableOldNameSuffixes', () => {
  it('uses the Old suffix when no suffixed name is taken', () => {
    expect(
      resolveAvailableOldNameSuffixes({
        names: ['inboxThread', 'inboxThreads'],
        takenNames: new Set(['inboxThread', 'inboxThreads']),
      }),
    ).toEqual({ nameSuffix: 'Old', labelSuffix: ' (Old)' });
  });

  it('numbers the suffix until every suffixed name is available', () => {
    expect(
      resolveAvailableOldNameSuffixes({
        names: ['inboxThread', 'inboxThreads'],
        takenNames: new Set(['inboxThreadOld', 'inboxThreadsOld2']),
      }),
    ).toEqual({ nameSuffix: 'Old3', labelSuffix: ' (Old) 3' });
  });
});
