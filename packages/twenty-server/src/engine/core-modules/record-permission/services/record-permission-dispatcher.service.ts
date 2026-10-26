import {
  Injectable,
  Logger,
  type OnModuleInit,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { validate as isUuid } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RecordPermissionJob } from 'src/engine/core-modules/record-permission/jobs/record-permission.job';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class RecordPermissionDispatcherService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(RecordPermissionDispatcherService.name);
  private listener: Client | undefined;
  private connecting = false;
  private shuttingDown = false;
  private readonly pendingNotifications = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: TwentyConfigService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly cronQueue: MessageQueueService,
    @InjectMessageQueue(MessageQueue.recordPermissionQueue)
    private readonly permissionQueue: MessageQueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.cronQueue.addCron({
      jobName: RecordPermissionDispatcherService.name,
      data: undefined,
      options: { repeat: { every: 10000 } },
    });
    await this.connectListener();
  }

  private async connectListener(): Promise<void> {
    if (this.listener || this.connecting || this.shuttingDown) return;
    this.connecting = true;
    const listener = new Client({
      connectionString: this.config.get('PG_DATABASE_URL'),
      ssl: this.config.get('PG_SSL_ALLOW_SELF_SIGNED')
        ? { rejectUnauthorized: false }
        : undefined,
    });
    listener.on('error', (error: Error) => {
      if (this.listener === listener) this.listener = undefined;
      this.logger.warn(
        `Permission notifications unavailable; reconciliation remains enabled: ${error.message}`,
      );
      void listener.end().catch(() => undefined);
    });
    listener.on('notification', (notification) => {
      const workspaceId = notification.payload;
      if (
        notification.channel !== 'record_permission_invalidation' ||
        !workspaceId ||
        !isUuid(workspaceId) ||
        this.pendingNotifications.has(workspaceId)
      )
        return;
      this.pendingNotifications.set(
        workspaceId,
        setTimeout(() => {
          this.pendingNotifications.delete(workspaceId);
          void this.enqueue(workspaceId).catch((error: unknown) =>
            this.logger.warn(
              `Permission work enqueue failed: ${String(error)}`,
            ),
          );
        }, 100),
      );
    });
    try {
      await listener.connect();
      await listener.query('LISTEN record_permission_invalidation');
      this.listener = listener;
    } catch (error) {
      this.logger.warn(
        `Permission notifications unavailable; reconciliation remains enabled: ${String(error)}`,
      );
      await listener.end().catch(() => undefined);
    } finally {
      this.connecting = false;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.shuttingDown = true;
    for (const timeout of this.pendingNotifications.values())
      clearTimeout(timeout);
    this.pendingNotifications.clear();
    await this.listener?.end().catch(() => undefined);
  }

  async enqueue(workspaceId: string, reconcile = false): Promise<void> {
    await this.permissionQueue.add(
      RecordPermissionJob.name,
      { workspaceId, reconcile },
      {
        deduplication: {
          id: `record-permission-${workspaceId}`,
          keepLastIfActive: true,
        },
        retryLimit: 5,
        backoff: { strategy: 'exponential', initialDelayMilliseconds: 1000 },
      },
    );
  }

  @Process(RecordPermissionDispatcherService.name)
  async handle(): Promise<void> {
    await this.connectListener();
    const workspaces: { workspaceId: string }[] = await this.dataSource.query(
      'SELECT DISTINCT "workspaceId" FROM core."recordPermissionRevision" WHERE status IN (\'active\', \'building\')',
    );

    for (const { workspaceId } of workspaces) {
      await this.enqueue(
        workspaceId,
        new Date().getUTCMinutes() % 15 === 0 &&
          new Date().getUTCSeconds() < 10,
      );
    }
  }
}
