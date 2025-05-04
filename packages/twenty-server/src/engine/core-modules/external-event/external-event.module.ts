import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { EventMetadataResolver } from './event-metadata.resolver';
import { ExternalEventController } from './external-event.controller';
import { ExternalEventResolver } from './external-event.resolver';

import { EventFieldMetadata } from './entities/event-field-metadata.entity';
import { EventMetadata } from './entities/event-metadata.entity';
import { EventMetadataService } from './services/event-metadata.service';
import { ExternalEventTokenService } from './services/external-event-token.service';
import { ExternalEventService } from './services/external-event.service';
import { ExternalEventValidator } from './validators/external-event.validator';

@Module({
  controllers: [ExternalEventController],
  providers: [
    ExternalEventService,
    ExternalEventResolver,
    ExternalEventTokenService,
    ExternalEventValidator,
    EventMetadataService,
    EventMetadataResolver,
  ],
  imports: [
    JwtModule,
    ClickHouseModule,
    TypeOrmModule.forFeature([AppToken, FeatureFlag], 'core'),
    TypeOrmModule.forFeature([EventMetadata, EventFieldMetadata], 'core'),
  ],
  exports: [
    ExternalEventService,
    ExternalEventTokenService,
    EventMetadataService,
  ],
})
export class ExternalEventModule implements OnModuleInit {
  private readonly logger = new Logger(ExternalEventModule.name);

  constructor(
    private readonly eventMetadataService: EventMetadataService,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  async onModuleInit() {
    try {
      // Check all workspaces with the feature flag enabled
      const externalEventFeatureFlags = await this.featureFlagRepository.find({
        where: {
          key: FeatureFlagKey.IsExternalEventEnabled,
          value: true,
        },
      });

      if (externalEventFeatureFlags.length === 0) {
        this.logger.log(
          'External Event feature is not enabled for any workspace',
        );

        return;
      }

      this.logger.log(
        `External Event feature is enabled for ${externalEventFeatureFlags.length} workspace(s)`,
      );
      await this.eventMetadataService.loadAllEventMetadata();
    } catch (error) {
      this.logger.error(
        `Failed to initialize External Event module: ${error.message}`,
      );
    }
  }
}
