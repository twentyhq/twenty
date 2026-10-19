import { buildAdminApplicationLogsFilter } from 'src/engine/core-modules/application/application-monitoring/utils/build-admin-application-logs-filter.util';

const PERIOD = {
  periodStart: new Date('2026-10-19T06:00:00.000Z'),
  periodEnd: new Date('2026-10-19T08:00:00.000Z'),
};

describe('buildAdminApplicationLogsFilter', () => {
  it('always scopes to the registration and the period', () => {
    expect(
      buildAdminApplicationLogsFilter({
        input: { applicationRegistrationId: 'registration-1' },
        period: PERIOD,
      }),
    ).toEqual({
      whereClause:
        'applicationRegistrationId = {applicationRegistrationId:String} AND timestamp >= {periodStart:DateTime64(3)} AND timestamp < {periodEnd:DateTime64(3)}',
      params: {
        applicationRegistrationId: 'registration-1',
        periodStart: '2026-10-19 06:00:00.000',
        periodEnd: '2026-10-19 08:00:00.000',
      },
    });
  });

  it('adds the optional workspace, level, function and search filters', () => {
    const { whereClause, params } = buildAdminApplicationLogsFilter({
      input: {
        applicationRegistrationId: 'registration-1',
        workspaceId: 'workspace-1',
        levels: ['ERROR', 'WARN'],
        logicFunctionName: 'syncContacts',
        search: 'authentication',
      },
      period: PERIOD,
    });

    expect(whereClause).toContain('workspaceId = {workspaceId:String}');
    expect(whereClause).toContain('level IN {levels:Array(String)}');
    expect(whereClause).toContain(
      'logicFunctionName = {logicFunctionName:String}',
    );
    expect(whereClause).toContain(
      'positionCaseInsensitive(message, {search:String}) > 0',
    );
    expect(params).toMatchObject({
      workspaceId: 'workspace-1',
      levels: ['ERROR', 'WARN'],
      logicFunctionName: 'syncContacts',
      search: 'authentication',
    });
  });

  it('ignores empty optional filters', () => {
    const { whereClause } = buildAdminApplicationLogsFilter({
      input: {
        applicationRegistrationId: 'registration-1',
        workspaceId: '',
        levels: [],
        search: '',
      },
      period: PERIOD,
    });

    expect(whereClause).not.toContain('workspaceId');
    expect(whereClause).not.toContain('level IN');
    expect(whereClause).not.toContain('positionCaseInsensitive');
  });
});
