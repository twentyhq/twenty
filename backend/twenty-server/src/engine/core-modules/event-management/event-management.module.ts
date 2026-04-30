import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CRMEventEntity, EventRegistrationEntity } from './event-management.entity';
import { EventManagementService } from './event-management.service';
import { EventManagementResolver } from './event-management.resolver';
import { EventManagementController } from './event-management.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CRMEventEntity, EventRegistrationEntity])],
  controllers: [EventManagementController],
  providers: [EventManagementService, EventManagementResolver],
  exports: [EventManagementService],
})
export class EventManagementModule {}
