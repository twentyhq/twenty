import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcessNestedRelationsV2Helper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations-v2.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonSelectFieldsHelper } from 'src/engine/api/common/common-select-fields/common-select-fields-helper';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';
import { EventStreamResolver } from 'src/engine/subscriptions/event-stream.resolver';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';
import { MetadataEventsToDbListener } from 'src/engine/subscriptions/metadata-event/metadata-events-to-db.listener';
import { ObjectRecordEventPublisher } from 'src/engine/subscriptions/object-record-event/object-record-event-publisher';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Global()
@Module({
  imports: [
    RedisClientModule,
    CacheStorageModule,
    CacheLockModule,
    MetricsModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    NavigationMenuItemModule,
  ],
  providers: [
    SubscriptionService,
    EventStreamService,
    EventStreamResolver,
    ObjectRecordEventPublisher,
    MetadataEventPublisher,
    MetadataEventEmitter,
    MetadataEventsToDbListener,
    ProcessNestedRelationsHelper,
    ProcessNestedRelationsV2Helper,
    CommonSelectFieldsHelper,
  ],
  exports: [
    SubscriptionService,
    ObjectRecordEventPublisher,
    MetadataEventEmitter,
  ],
})
export class SubscriptionsModule {}
