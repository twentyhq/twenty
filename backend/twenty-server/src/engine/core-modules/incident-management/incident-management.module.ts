import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentEntity, IncidentTimelineEntity, PostmortemEntity, EscalationPolicyEntity } from './incident-management.entity';
import { IncidentManagementService } from './incident-management.service';
import { IncidentManagementResolver } from './incident-management.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([IncidentEntity, IncidentTimelineEntity, PostmortemEntity, EscalationPolicyEntity])],
  providers: [IncidentManagementService, IncidentManagementResolver],
  exports: [IncidentManagementService],
})
export class IncidentManagementModule {}
