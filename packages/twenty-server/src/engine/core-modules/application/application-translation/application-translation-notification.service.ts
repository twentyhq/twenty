import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const BROADCAST_BATCH_SIZE = 50;

@Injectable()
export class ApplicationTranslationNotificationService {
  private readonly logger = new Logger(
    ApplicationTranslationNotificationService.name,
  );

  constructor(
    // A registration's catalog is shared by installations in every workspace.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  async notifyCatalogUpdated(applicationRegistrationId: string): Promise<void> {
    try {
      const applications = await this.applicationRepository.find({
        where: { applicationRegistrationId },
        select: { id: true, workspaceId: true },
      });
      for (const batch of chunk(applications, BROADCAST_BATCH_SIZE)) {
        await Promise.all(
          batch.map((application) =>
            this.workspaceEventBroadcaster.broadcast({
              workspaceId: application.workspaceId,
              events: [
                {
                  type: 'updated',
                  entityName: 'application',
                  recordId: application.id,
                  properties: {
                    updatedFields: ['translationCatalog'],
                    after: {
                      id: application.id,
                      translationCatalogUpdated: true,
                    },
                  },
                },
              ],
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to broadcast application translation changes for registration ${applicationRegistrationId}`,
        error,
      );
    }
  }
}
