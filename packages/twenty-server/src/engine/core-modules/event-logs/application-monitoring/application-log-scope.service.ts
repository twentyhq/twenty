/* @license Enterprise */

import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventLogTable } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';
import { type EventLogQueryInput } from 'src/engine/core-modules/event-logs/dtos/event-log-query.input';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';
import { validateEventLogFieldFilterOrThrow } from 'src/engine/core-modules/event-logs/utils/validate-event-log-field-filter-or-throw.util';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Injectable()
export class ApplicationLogScopeService {
  constructor(
    // Instance access is authorized before looking up installations across workspaces.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly retentionService: EventLogRetentionService,
  ) {}

  async resolve({
    workspace,
    input,
    user,
    callingApplicationId,
  }: {
    workspace: Pick<WorkspaceEntity, 'id' | 'eventLogRetentionDays'>;
    input: EventLogQueryInput;
    user?: UserEntity;
    callingApplicationId?: string;
  }) {
    const fieldFilters = input.filters?.fieldFilters ?? [];
    fieldFilters.forEach((fieldFilter) =>
      validateEventLogFieldFilterOrThrow({ fieldFilter, table: input.table }),
    );
    const appFilters = fieldFilters.filter(
      ({ field }) => field === 'applicationId',
    );
    const isAdmin =
      isDefined(user) &&
      user.canAccessFullAdminPanel === true &&
      !isDefined(callingApplicationId);
    const selectedApplications =
      input.table === EventLogTable.APPLICATION_LOG &&
      isDefined(user) &&
      appFilters.length === 1 &&
      appFilters[0].operand === EventLogFilterOperand.IS
        ? await this.applicationRepository.find({
            where: { id: In(appFilters[0].values), workspaceId: workspace.id },
            relations: { applicationRegistration: true },
          })
        : [];
    const ownsSelection =
      isNonEmptyArray(selectedApplications) &&
      selectedApplications.length === appFilters[0]?.values.length &&
      selectedApplications.every(
        (application) =>
          application.applicationRegistration?.ownerWorkspaceId ===
          workspace.id,
      );
    const canQueryInstanceLevel =
      input.table === EventLogTable.APPLICATION_LOG &&
      !isDefined(callingApplicationId) &&
      isDefined(user) &&
      (isAdmin || ownsSelection);

    if (input.instanceLevel && !canQueryInstanceLevel) {
      throw new ForbiddenException(
        'Instance logs require an instance administrator or the owner workspace of every selected app.',
      );
    }

    if (!input.instanceLevel) {
      const localFilters = await Promise.all(
        fieldFilters.map(async (filter) => {
          if (filter.field !== 'applicationId') return filter;
          const applications = await this.applicationRepository.find({
            where: { id: In(filter.values), workspaceId: workspace.id },
            select: { applicationRegistrationId: true },
          });
          return {
            ...filter,
            values: [
              ...new Set([
                ...filter.values,
                ...applications.flatMap(({ applicationRegistrationId }) =>
                  applicationRegistrationId ? [applicationRegistrationId] : [],
                ),
              ]),
            ],
          };
        }),
      );
      return {
        canQueryInstanceLevel,
        workspaces: [
          {
            ...workspace,
            displayName: undefined as string | undefined,
            retentionStartDate:
              await this.retentionService.getRetentionStartDate({
                workspaceId: workspace.id,
                workspaceRetentionInDays: workspace.eventLogRetentionDays,
              }),
          },
        ],
        filters: { ...input.filters, fieldFilters: localFilters },
      };
    }

    const expandedFilters = await Promise.all(
      fieldFilters.map(async (filter) => {
        if (filter.field === 'applicationId') {
          const applications = await this.applicationRepository.find({
            where: { id: In(filter.values), workspaceId: workspace.id },
          });
          const registrationIds = applications.flatMap(
            ({ applicationRegistrationId }) =>
              isDefined(applicationRegistrationId)
                ? [applicationRegistrationId]
                : [],
          );
          const installations = isNonEmptyArray(registrationIds)
            ? await this.applicationRepository.find({
                where: { applicationRegistrationId: In(registrationIds) },
                withDeleted: true,
                select: { id: true },
              })
            : [];
          return {
            ...filter,
            values: [
              ...new Set([
                ...installations.map(({ id }) => id),
                ...registrationIds,
                ...filter.values,
              ]),
            ],
          };
        }
        if (
          filter.field === 'functionOrEvent' ||
          filter.field === 'logicFunctionId'
        ) {
          const functionIds = filter.values.filter(
            (value) => !value.startsWith('event:'),
          );
          const functions = isNonEmptyArray(functionIds)
            ? await this.logicFunctionRepository.find({
                where: { id: In(functionIds), workspaceId: workspace.id },
                relations: { application: true },
                withDeleted: true,
              })
            : [];
          const pairs = functions.flatMap((logicFunction) =>
            isDefined(logicFunction.application?.applicationRegistrationId)
              ? [
                  {
                    universalIdentifier: logicFunction.universalIdentifier,
                    application: {
                      applicationRegistrationId:
                        logicFunction.application.applicationRegistrationId,
                    },
                  },
                ]
              : [],
          );
          const installedFunctions = isNonEmptyArray(pairs)
            ? await this.logicFunctionRepository.find({
                where: pairs,
                withDeleted: true,
                select: { id: true },
              })
            : [];
          return {
            ...filter,
            values: [
              ...new Set([
                ...filter.values,
                ...installedFunctions.map(({ id }) => id),
              ]),
            ],
          };
        }
        return filter;
      }),
    );

    const workspaces = await this.workspaceRepository.find({
      select: { id: true, displayName: true, eventLogRetentionDays: true },
    });
    // Retention belongs to the workspace that produced a log, including in instance views.
    const retainedWorkspaces: ((typeof workspaces)[number] & {
      retentionStartDate: Date;
    })[] = [];
    for (let offset = 0; offset < workspaces.length; offset += 20) {
      retainedWorkspaces.push(
        ...(await Promise.all(
          workspaces.slice(offset, offset + 20).map(async (target) => ({
            ...target,
            retentionStartDate:
              await this.retentionService.getRetentionStartDate({
                workspaceId: target.id,
                workspaceRetentionInDays: target.eventLogRetentionDays,
              }),
          })),
        )),
      );
    }
    return {
      canQueryInstanceLevel,
      workspaces: retainedWorkspaces,
      filters: { ...input.filters, fieldFilters: expandedFilters },
    };
  }
}
