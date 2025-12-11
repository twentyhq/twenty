import { Injectable } from '@nestjs/common';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { type TimelineThreadsWithTotalDTO } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { formatThreads } from 'src/engine/core-modules/messaging/utils/format-threads.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class GetMessagesService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly timelineMessagingService: TimelineMessagingService,
  ) {}

  async getMessagesFromPersonIds(
    workspaceMemberId: string,
    personIds: string[],
    workspaceId: string,
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotalDTO> {
    const offset = (page - 1) * pageSize;

    const { messageThreads, totalNumberOfThreads } =
      await this.timelineMessagingService.getAndCountMessageThreads(
        personIds,
        workspaceId,
        offset,
        pageSize,
      );

    if (!messageThreads) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
      };
    }

    const messageThreadIds = messageThreads.map(
      (messageThread) => messageThread.id,
    );

    const threadParticipantsByThreadId =
      await this.timelineMessagingService.getThreadParticipantsByThreadId(
        messageThreadIds,
        workspaceId,
      );

    const threadVisibilityByThreadId =
      await this.timelineMessagingService.getThreadVisibilityByThreadId(
        messageThreadIds,
        workspaceMemberId,
        workspaceId,
      );

    return {
      totalNumberOfThreads,
      timelineThreads: formatThreads(
        messageThreads,
        threadParticipantsByThreadId,
        threadVisibilityByThreadId,
      ),
    };
  }

  async getMessagesFromCompanyId(
    workspaceMemberId: string,
    companyId: string,
    workspaceId: string,
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspaceId,
            'person',
            { shouldBypassPermissionChecks: true },
          );
        const personIds = (
          await personRepository.find({
            where: {
              companyId,
            },
            select: {
              id: true,
            },
          })
        ).map((person) => person.id);

        if (personIds.length === 0) {
          return {
            totalNumberOfThreads: 0,
            timelineThreads: [],
          };
        }

        const messageThreads = await this.getMessagesFromPersonIds(
          workspaceMemberId,
          personIds,
          workspaceId,
          page,
          pageSize,
        );

        return messageThreads;
      },
    );
  }

  async getMessagesFromOpportunityId(
    workspaceMemberId: string,
    opportunityId: string,
    workspaceId: string,
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotalDTO> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const opportunityRepository =
          await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
            workspaceId,
            'opportunity',
            { shouldBypassPermissionChecks: true },
          );

        const opportunity = await opportunityRepository.findOne({
          where: {
            id: opportunityId,
          },
          select: {
            companyId: true,
          },
        });

        if (!opportunity?.companyId) {
          return {
            totalNumberOfThreads: 0,
            timelineThreads: [],
          };
        }

        const messageThreads = await this.getMessagesFromCompanyId(
          workspaceMemberId,
          opportunity.companyId,
          workspaceId,
          page,
          pageSize,
        );

        return messageThreads;
      },
    );
  }
}
