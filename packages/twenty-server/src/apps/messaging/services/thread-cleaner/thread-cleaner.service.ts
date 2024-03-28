import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageThreadRepository } from 'src/apps/messaging/repositories/message-thread.repository';
import { MessageRepository } from 'src/apps/messaging/repositories/message.repository';
import { deleteUsingPagination } from 'src/apps/messaging/services/thread-cleaner/utils/delete-using-pagination.util';
import { MessageThreadObjectMetadata } from 'src/apps/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/apps/messaging/standard-objects/message.object-metadata';

@Injectable()
export class ThreadCleanerService {
  constructor(
    @InjectObjectMetadataRepository(MessageObjectMetadata)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageThreadObjectMetadata)
    private readonly messageThreadRepository: MessageThreadRepository,
  ) {}

  public async cleanWorkspaceThreads(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      this.messageRepository.getNonAssociatedMessageIdsPaginated.bind(
        this.messageRepository,
      ),
      this.messageRepository.deleteByIds.bind(this.messageRepository),
    );

    await deleteUsingPagination(
      workspaceId,
      500,
      this.messageThreadRepository.getOrphanThreadIdsPaginated.bind(
        this.messageThreadRepository,
      ),
      this.messageThreadRepository.deleteByIds.bind(
        this.messageThreadRepository,
      ),
    );
  }
}
