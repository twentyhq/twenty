import { buildGroupKeyMemoryObservations } from 'src/engine/core-modules/message-queue/utils/build-group-key-memory-observations.util';

describe('buildGroupKeyMemoryObservations', () => {
  it('labels each group key with its type', () => {
    expect(
      buildGroupKeyMemoryObservations({
        usages: [
          { groupKey: 'workspace:ws-1', usedBytes: 300 },
          { groupKey: 'application:app-1', usedBytes: 200 },
        ],
        previouslyReportedGroupKeys: new Set(),
      }),
    ).toEqual([
      {
        value: 300,
        attributes: { group_key: 'workspace:ws-1', group_type: 'workspace' },
      },
      {
        value: 200,
        attributes: {
          group_key: 'application:app-1',
          group_type: 'application',
        },
      },
    ]);
  });

  it('reports zero for a group key that left the reported set', () => {
    expect(
      buildGroupKeyMemoryObservations({
        usages: [{ groupKey: 'workspace:ws-1', usedBytes: 300 }],
        previouslyReportedGroupKeys: new Set([
          'workspace:ws-1',
          'workspace:ws-2',
        ]),
      }),
    ).toEqual([
      {
        value: 300,
        attributes: { group_key: 'workspace:ws-1', group_type: 'workspace' },
      },
      {
        value: 0,
        attributes: { group_key: 'workspace:ws-2', group_type: 'workspace' },
      },
    ]);
  });
});
