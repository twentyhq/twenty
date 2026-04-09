import { Module } from '@nestjs/common';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { SeedCrmObjectsCommand } from 'src/modules/crm-acceleration/commands/seed-crm-objects.command';
import { CrmAccelerationController } from 'src/modules/crm-acceleration/controllers/crm-acceleration.controller';
import { CrmAccelerationPersistenceService } from 'src/modules/crm-acceleration/services/crm-acceleration-persistence.service';
import { CrmObjectsSeederService } from 'src/modules/crm-acceleration/services/crm-objects-seeder.service';
import { CustomerSuccessService } from 'src/modules/crm-acceleration/services/customer-success.service';
import { DataQualityCommandCenterService } from 'src/modules/crm-acceleration/services/data-quality-command-center.service';
import { EngagementAutomationService } from 'src/modules/crm-acceleration/services/engagement-automation.service';
import { ExecutiveScorecardService } from 'src/modules/crm-acceleration/services/executive-scorecard.service';
import { FeatureRegistryService } from 'src/modules/crm-acceleration/services/feature-registry.service';
import { FieldRbacService } from 'src/modules/crm-acceleration/services/field-rbac.service';
import { McpExtensionPointsService } from 'src/modules/crm-acceleration/services/mcp-extension-points.service';
import { PipelineExecutionService } from 'src/modules/crm-acceleration/services/pipeline-execution.service';

@Module({
  imports: [
    KeyValuePairModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSourceModule,
  ],
  controllers: [CrmAccelerationController],
  providers: [
    FeatureRegistryService,
    CrmAccelerationPersistenceService,
    PipelineExecutionService,
    ExecutiveScorecardService,
    CustomerSuccessService,
    EngagementAutomationService,
    DataQualityCommandCenterService,
    FieldRbacService,
    McpExtensionPointsService,
    CrmObjectsSeederService,
    SeedCrmObjectsCommand,
  ],
  exports: [FeatureRegistryService, CrmObjectsSeederService],
})
export class CrmAccelerationModule {}
