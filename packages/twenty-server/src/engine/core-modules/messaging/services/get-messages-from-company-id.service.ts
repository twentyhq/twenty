import { Injectable } from '@nestjs/common';

import { TIMELINE_THREADS_DEFAULT_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { TimelineThreadsWithTotal } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { GetMessagesFromPersonIdsService } from 'src/engine/core-modules/messaging/services/get-messages-from-person-ids.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class GetMessagesFromCompanyIdService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly getMessagesFromPersonIdsService: GetMessagesFromPersonIdsService,
  ) {}

  async getMessagesFromCompanyId(
    workspaceMemberId: string,
    companyId: string,
    page = 1,
    pageSize: number = TIMELINE_THREADS_DEFAULT_PAGE_SIZE,
  ): Promise<TimelineThreadsWithTotal> {
    const personRepository =
      await this.twentyORMManager.getRepository<PersonWorkspaceEntity>(
        'person',
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

    if (!personIds) {
      return {
        totalNumberOfThreads: 0,
        timelineThreads: [],
      };
    }

    const messageThreads =
      await this.getMessagesFromPersonIdsService.getMessagesFromPersonIds(
        workspaceMemberId,
        personIds,
        page,
        pageSize,
      );

    return messageThreads;
  }
}
