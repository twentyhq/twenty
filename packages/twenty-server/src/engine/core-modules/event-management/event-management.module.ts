import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CRMEventEntity, EventRegistrationEntity } from './event-management.entity';
import { EventManagementService } from './event-management.service';

@Module({
  imports: [TypeOrmModule.forFeature([CRMEventEntity, EventRegistrationEntity])],
  providers: [EventManagementService],
  exports: [EventManagementService],
})
export class EventManagementModule {}
