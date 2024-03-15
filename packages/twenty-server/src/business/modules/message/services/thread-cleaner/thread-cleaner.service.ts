import { Injectable } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine-metadata/data-source/data-source.service';
import { MessageThreadService } from 'src/business/modules/message/repositories/message-thread/message-thread.service';
import { MessageService } from 'src/business/modules/message/repositories/message/message.service';
import { deleteUsingPagination } from 'src/business/modules/message/services/thread-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class ThreadCleanerService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly messageService: MessageService,
    private readonly messageThreadService: MessageThreadService,
  ) {}

  public async cleanWorkspaceThreads(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      this.messageService.getNonAssociatedMessageIdsPaginated.bind(
        this.messageService,
      ),
      this.messageService.deleteByIds.bind(this.messageService),
    );

    await deleteUsingPagination(
      workspaceId,
      500,
      this.messageThreadService.getOrphanThreadIdsPaginated.bind(
        this.messageThreadService,
      ),
      this.messageThreadService.deleteByIds.bind(this.messageThreadService),
    );
  }
}
