import { getLogConsoleRecordChangeActor } from '@/log-console/utils/getLogConsoleRecordChangeActor';

const ZAPIER_SYNC_ACTOR = {
  source: 'API',
  workspaceMemberId: null,
  name: 'Zapier sync',
  context: {},
};

const UNNAMED_ACTOR = {
  source: 'MANUAL',
  workspaceMemberId: null,
  name: '',
  context: {},
};

const getActor = ({
  userId,
  updatedBy,
}: {
  userId: string | null;
  updatedBy: object;
}) =>
  getLogConsoleRecordChangeActor({
    event: 'Object Record Updated',
    timestamp: '2026-09-24T11:45:58.561Z',
    userId,
    properties: { after: { updatedBy } },
  });

describe('getLogConsoleRecordChangeActor', () => {
  it('should use the named actor of the snapshot', () => {
    expect(getActor({ userId: null, updatedBy: ZAPIER_SYNC_ACTOR })).toEqual(
      ZAPIER_SYNC_ACTOR,
    );
  });

  it('should leave an unnamed actor to the member of the user', () => {
    expect(
      getActor({
        userId: 'cefec196-1610-4e82-95db-99ed5856117b',
        updatedBy: UNNAMED_ACTOR,
      }),
    ).toBeUndefined();
  });

  it('should read System without a named actor or a user', () => {
    expect(getActor({ userId: null, updatedBy: UNNAMED_ACTOR })).toEqual({
      source: 'SYSTEM',
      name: 'System',
    });
  });
});
