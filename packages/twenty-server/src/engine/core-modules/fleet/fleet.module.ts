import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetVehicleEntity, FleetDriverEntity, FleetDeliveryEntity, FleetRouteEntity, FuelLogEntity, MaintenanceOrderEntity } from './fleet.entity';
import { FleetService } from './fleet.service';

@Module({
  imports: [TypeOrmModule.forFeature([FleetVehicleEntity, FleetDriverEntity, FleetDeliveryEntity, FleetRouteEntity, FuelLogEntity, MaintenanceOrderEntity])],
  providers: [FleetService],
  exports: [FleetService],
})
export class FleetModule {}
