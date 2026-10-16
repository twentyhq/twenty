import { ForbiddenException } from '@nestjs/common';
import { EventLogTable } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationLogScopeService } from 'src/engine/core-modules/event-logs/application-monitoring/application-log-scope.service';
import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';
import { type EventLogQueryInput } from 'src/engine/core-modules/event-logs/dtos/event-log-query.input';
import { type EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

jest.mock('src/engine/core-modules/application/application.entity', () => ({
  ApplicationEntity: class {},
}));
jest.mock('src/engine/core-modules/workspace/workspace.entity', () => ({
  WorkspaceEntity: class {},
}));
jest.mock(
  'src/engine/metadata-modules/logic-function/logic-function.entity',
  () => ({ LogicFunctionEntity: class {} }),
);
jest.mock(
  'src/engine/core-modules/event-logs/retention/services/event-log-retention.service',
  () => ({ EventLogRetentionService: class {} }),
);

const workspace = { id: 'owner', eventLogRetentionDays: 7 };
const app = {
  id: 'local-app',
  applicationRegistrationId: 'registration',
  applicationRegistration: { ownerWorkspaceId: 'owner' },
};
const user = { id: 'user', canAccessFullAdminPanel: false } as UserEntity;
const input: EventLogQueryInput = {
  table: EventLogTable.APPLICATION_LOG,
  instanceLevel: true,
  filters: {
    fieldFilters: [
      {
        field: 'applicationId',
        operand: EventLogFilterOperand.IS,
        values: ['local-app'],
      },
    ],
  },
};

describe('ApplicationLogScopeService', () => {
  const applications = { find: jest.fn() };
  const workspaces = { find: jest.fn() };
  const functions = { find: jest.fn() };
  const retention = { getRetentionStartDate: jest.fn() };
  const service = new ApplicationLogScopeService(
    applications as unknown as Repository<ApplicationEntity>,
    workspaces as unknown as Repository<WorkspaceEntity>,
    functions as unknown as Repository<LogicFunctionEntity>,
    retention as unknown as EventLogRetentionService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    applications.find.mockResolvedValue([app]);
    workspaces.find.mockResolvedValue([
      { ...workspace, displayName: 'Owner' },
      { id: 'customer', displayName: 'Customer', eventLogRetentionDays: 1 },
    ]);
    retention.getRetentionStartDate.mockImplementation(
      async ({ workspaceId }) =>
        new Date(workspaceId === 'owner' ? '2026-10-01' : '2026-10-15'),
    );
    functions.find.mockResolvedValue([]);
  });

  it('expands an owned app to all installations and failed first installs', async () => {
    applications.find
      .mockResolvedValueOnce([app])
      .mockResolvedValueOnce([app])
      .mockResolvedValueOnce([
        { id: 'remote-app' },
        { id: 'deleted-installation' },
      ]);
    const scope = await service.resolve({ workspace, input, user });
    expect(scope.canQueryInstanceLevel).toBe(true);
    expect(scope.filters?.fieldFilters?.[0].values).toEqual(
      expect.arrayContaining([
        'local-app',
        'remote-app',
        'deleted-installation',
        'registration',
      ]),
    );
    expect(applications.find).toHaveBeenLastCalledWith(
      expect.objectContaining({ withDeleted: true }),
    );
    expect(
      scope.workspaces.map(({ retentionStartDate }) =>
        retentionStartDate.toISOString(),
      ),
    ).toEqual(['2026-10-01T00:00:00.000Z', '2026-10-15T00:00:00.000Z']);
    expect(workspaces.find).toHaveBeenCalledWith({
      select: { id: true, displayName: true, eventLogRetentionDays: true },
    });
  });

  it.each([
    { label: 'no user', actor: undefined, selection: input.filters },
    { label: 'no app selection', actor: user, selection: undefined },
    {
      label: 'negative app selection',
      actor: user,
      selection: {
        fieldFilters: [
          {
            ...input.filters!.fieldFilters![0],
            operand: EventLogFilterOperand.IS_NOT,
          },
        ],
      },
    },
    { label: 'unknown app', actor: user, selection: input.filters, apps: [] },
    {
      label: 'another owner',
      actor: user,
      selection: input.filters,
      apps: [
        { ...app, applicationRegistration: { ownerWorkspaceId: 'another' } },
      ],
    },
    {
      label: 'mixed ownership',
      actor: user,
      selection: {
        fieldFilters: [
          {
            ...input.filters!.fieldFilters![0],
            values: ['local-app', 'foreign'],
          },
        ],
      },
      apps: [
        app,
        {
          ...app,
          id: 'foreign',
          applicationRegistration: { ownerWorkspaceId: 'another' },
        },
      ],
    },
  ])(
    'rejects instance scope for $label',
    async ({ actor, selection, apps }) => {
      if (apps) applications.find.mockResolvedValue(apps);
      await expect(
        service.resolve({
          workspace,
          user: actor,
          input: { ...input, filters: selection },
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(workspaces.find).not.toHaveBeenCalled();
      expect(retention.getRetentionStartDate).not.toHaveBeenCalled();
    },
  );

  it('allows an instance admin without an app filter', async () => {
    const scope = await service.resolve({
      workspace,
      user: { ...user, canAccessFullAdminPanel: true },
      input: { ...input, filters: undefined },
    });
    expect(scope.canQueryInstanceLevel).toBe(true);
    expect(scope.workspaces).toHaveLength(2);
  });

  it('rejects instance access by application callers even with a user', async () => {
    await expect(
      service.resolve({
        workspace,
        user: { ...user, canAccessFullAdminPanel: true },
        callingApplicationId: 'caller',
        input,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('never expands security logs to instance scope', async () => {
    await expect(
      service.resolve({
        workspace,
        user: { ...user, canAccessFullAdminPanel: true },
        input: { table: EventLogTable.WORKSPACE_EVENT, instanceLevel: true },
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('keeps local logs within the current workspace, including registration events', async () => {
    const scope = await service.resolve({
      workspace,
      user,
      input: { ...input, instanceLevel: false },
    });
    expect(scope.workspaces.map(({ id }) => id)).toEqual(['owner']);
    expect(scope.filters?.fieldFilters?.[0].values).toEqual([
      'local-app',
      'registration',
    ]);
    expect(workspaces.find).not.toHaveBeenCalled();
  });

  it('maps function filters across installations without treating event names as UUIDs', async () => {
    functions.find
      .mockResolvedValueOnce([
        {
          id: 'function',
          universalIdentifier: 'universal-function',
          application: { applicationRegistrationId: 'registration' },
        },
      ])
      .mockResolvedValueOnce([{ id: 'remote-function' }]);
    const scope = await service.resolve({
      workspace,
      user,
      input: {
        ...input,
        filters: {
          fieldFilters: [
            ...input.filters!.fieldFilters!,
            {
              field: 'functionOrEvent',
              operand: EventLogFilterOperand.IS,
              values: ['function', 'event:application.install.failed'],
            },
          ],
        },
      },
    });
    expect(functions.find.mock.calls[0][0].where.id.value).toEqual([
      'function',
    ]);
    expect(functions.find.mock.calls[1][0].where).toEqual([
      {
        universalIdentifier: 'universal-function',
        application: { applicationRegistrationId: 'registration' },
      },
    ]);
    expect(scope.filters?.fieldFilters?.[1].values).toEqual([
      'function',
      'event:application.install.failed',
      'remote-function',
    ]);
  });

  it('validates caller filters before expansion', async () => {
    await expect(
      service.resolve({
        workspace,
        user,
        input: {
          ...input,
          filters: {
            fieldFilters: [
              {
                field: 'workspaceId',
                operand: EventLogFilterOperand.IS,
                values: ['customer'],
              },
            ],
          },
        },
      }),
    ).rejects.toThrow();
    expect(applications.find).not.toHaveBeenCalled();
  });
});
