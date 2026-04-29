import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderEntity, TechnicianEntity, ServiceContractEntity } from './field-service.entity';
import { FieldServiceService } from './field-service.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrderEntity, TechnicianEntity, ServiceContractEntity])],
  providers: [FieldServiceService],
  exports: [FieldServiceService],
})
export class FieldServiceModule {}
