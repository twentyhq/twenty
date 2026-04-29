import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderEntity, TechnicianEntity, ServiceContractEntity } from './field-service.entity';
import { FieldServiceService } from './field-service.service';
import { FieldServiceResolver } from './field-service.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrderEntity, TechnicianEntity, ServiceContractEntity])],
  providers: [FieldServiceService, FieldServiceResolver],
  exports: [FieldServiceService],
})
export class FieldServiceModule {}
