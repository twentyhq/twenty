import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetVehicleEntity, FleetDriverEntity, FleetDeliveryEntity, FleetRouteEntity, FuelLogEntity, MaintenanceOrderEntity } from './fleet.entity';
import { FleetService } from './fleet.service';
import { FleetResolver } from './fleet.resolver';
import { FleetController } from './fleet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FleetVehicleEntity, FleetDriverEntity, FleetDeliveryEntity, FleetRouteEntity, FuelLogEntity, MaintenanceOrderEntity])],
  controllers: [FleetController],
  providers: [FleetService, FleetResolver],
  exports: [FleetService],
})
export class FleetModule {}
