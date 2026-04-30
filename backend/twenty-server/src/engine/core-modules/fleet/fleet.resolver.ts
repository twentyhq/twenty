import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FleetService } from './fleet.service';

// --- DTOs ---
@ObjectType()
class FleetVehicleDTO {
  @Field() id: string;
  @Field({ nullable: true }) plateNumber?: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Int, { nullable: true }) odometerKm?: number;
}

@ObjectType()
class FleetDriverDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) isAvailable?: boolean;
  @Field(() => Int, { nullable: true }) performanceScore?: number;
}

@ObjectType()
class FleetDeliveryDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) driverId?: string;
  @Field({ nullable: true }) trackingLink?: string;
  @Field(() => Float, { nullable: true }) totalCost?: number;
}

@ObjectType()
class FleetRouteDTO {
  @Field() id: string;
  @Field(() => Float, { nullable: true }) totalDistanceKm?: number;
  @Field(() => Int, { nullable: true }) estimatedMinutes?: number;
  @Field(() => Int, { nullable: true }) totalStops?: number;
}

@ObjectType()
class FuelLogDTO {
  @Field() id: string;
  @Field(() => Float) liters: number;
  @Field(() => Float) cost: number;
  @Field({ nullable: true }) isAnomaly?: boolean;
  @Field({ nullable: true }) anomalyType?: string;
}

@ObjectType()
class FleetAnalyticsDTO {
  @Field(() => Int) totalVehicles: number;
  @Field(() => Int) activeDeliveries: number;
  @Field(() => Float) avgCostPerDelivery: number;
  @Field(() => Int) onTimeRate: number;
  @Field(() => Float) avgRating: number;
  @Field(() => Int) totalKm: number;
  @Field(() => Float) fuelCost: number;
  @Field(() => Float) maintenanceCost: number;
  @Field(() => Int) anomalyCount: number;
}

@ObjectType()
class DriverPerformanceDTO {
  @Field() driverId: string;
  @Field() name: string;
  @Field(() => Int) score: number;
  @Field(() => Int) deliveries: number;
  @Field(() => Int) onTimeRate: number;
  @Field(() => Float) avgRating: number;
  @Field(() => Int) fuelEfficiency: number;
  @Field(() => Int) totalKm: number;
}

@ObjectType()
class CostPerDeliveryDTO {
  @Field() deliveryId: string;
  @Field({ nullable: true }) dealId?: string;
  @Field({ nullable: true }) accountId?: string;
  @Field(() => Float) fuel: number;
  @Field(() => Float) labor: number;
  @Field(() => Float) depreciation: number;
  @Field(() => Float) total: number;
}

@InputType()
class RegisterVehicleInput {
  @Field({ nullable: true }) plateNumber?: string;
  @Field({ nullable: true }) make?: string;
  @Field({ nullable: true }) model?: string;
  @Field(() => Float, { nullable: true }) capacityKg?: number;
}

@InputType()
class RegisterDriverInput {
  @Field() name: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) licenseNumber?: string;
}

@InputType()
class CreateDeliveryInput {
  @Field({ nullable: true }) dealId?: string;
  @Field({ nullable: true }) accountId?: string;
  @Field({ nullable: true }) deliveryAddress?: string;
  @Field(() => Float, { nullable: true }) deliveryLat?: number;
  @Field(() => Float, { nullable: true }) deliveryLng?: number;
}

@InputType()
class CompleteDeliveryInput {
  @Field({ nullable: true }) signature?: string;
  @Field(() => [String], { nullable: true }) photoIds?: string[];
  @Field(() => Float, { nullable: true }) lat?: number;
  @Field(() => Float, { nullable: true }) lng?: number;
  @Field(() => Int, { nullable: true }) customerRating?: number;
  @Field({ nullable: true }) customerFeedback?: string;
}

@InputType()
class RecordFuelInput {
  @Field() vehicleId: string;
  @Field(() => Float) liters: number;
  @Field(() => Float) cost: number;
  @Field(() => Int) odometerKm: number;
  @Field({ nullable: true }) driverId?: string;
  @Field({ nullable: true }) station?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class FleetResolver {
  constructor(private readonly service: FleetService) {}

  @Mutation(() => FleetVehicleDTO)
  async registerVehicle(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RegisterVehicleInput,
  ) {
    return this.service.registerVehicle(workspace.id, input);
  }

  @Mutation(() => FleetDriverDTO)
  async registerDriver(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RegisterDriverInput,
  ) {
    return this.service.registerDriver(workspace.id, input);
  }

  @Mutation(() => FleetDeliveryDTO)
  async createDelivery(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateDeliveryInput,
  ) {
    return this.service.createDelivery(workspace.id, input);
  }

  @Mutation(() => FleetDeliveryDTO)
  async autoDispatchDelivery(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('deliveryId') deliveryId: string,
  ) {
    return this.service.autoDispatch(workspace.id, deliveryId);
  }

  @Mutation(() => FleetRouteDTO)
  async optimizeRoute(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('driverId') driverId: string,
    @Args('deliveryIds', { type: () => [String] }) deliveryIds: string[],
  ) {
    return this.service.optimizeRoute(workspace.id, driverId, deliveryIds);
  }

  @Mutation(() => FleetDeliveryDTO)
  async completeDelivery(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('deliveryId') deliveryId: string,
    @Args('input') input: CompleteDeliveryInput,
  ) {
    return this.service.completeDelivery(deliveryId, input);
  }

  @Mutation(() => FuelLogDTO)
  async recordFuel(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RecordFuelInput,
  ) {
    return this.service.recordFuel(workspace.id, input.vehicleId, {
      liters: input.liters, cost: input.cost,
      odometerKm: input.odometerKm, driverId: input.driverId, station: input.station,
    });
  }

  @Query(() => FleetAnalyticsDTO)
  async getFleetAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getAnalytics(workspace.id);
  }

  @Query(() => [DriverPerformanceDTO])
  async getDriverPerformance(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getDriverPerformance(workspace.id);
  }

  @Query(() => [CostPerDeliveryDTO])
  async getCostPerDelivery(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getCostPerDelivery(workspace.id);
  }
}
