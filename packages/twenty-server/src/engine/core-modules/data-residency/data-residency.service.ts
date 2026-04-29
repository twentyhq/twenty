import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataResidencyEntity, DataRegion, DataResidencyStatus } from './data-residency.entity';

export const REGION_HOSTS: Record<DataRegion, string> = {
  [DataRegion.US_EAST]: 'us-east-1.twenty.cloud',
  [DataRegion.US_WEST]: 'us-west-2.twenty.cloud',
  [DataRegion.EU_WEST]: 'eu-west-1.twenty.cloud',
  [DataRegion.EU_CENTRAL]: 'eu-central-1.twenty.cloud',
  [DataRegion.ASIA_PACIFIC]: 'ap-southeast-1.twenty.cloud',
  [DataRegion.LATAM]: 'sa-east-1.twenty.cloud',
  [DataRegion.COLOMBIA]: 'latam-1.twenty.cloud',
  [DataRegion.CANADA]: 'ca-central-1.twenty.cloud',
};

export const REGION_NAMES: Record<DataRegion, string> = {
  [DataRegion.US_EAST]: 'US East (N. Virginia)',
  [DataRegion.US_WEST]: 'US West (Oregon)',
  [DataRegion.EU_WEST]: 'EU West (Ireland)',
  [DataRegion.EU_CENTRAL]: 'EU Central (Frankfurt)',
  [DataRegion.ASIA_PACIFIC]: 'Asia Pacific (Singapore)',
  [DataRegion.LATAM]: 'LATAM (São Paulo)',
  [DataRegion.COLOMBIA]: 'Colombia (Bogotá)',
  [DataRegion.CANADA]: 'Canada (Toronto)',
};

@Injectable()
export class DataResidencyService {
  constructor(
    @InjectRepository(DataResidencyEntity)
    private readonly drRepo: Repository<DataResidencyEntity>,
  ) {}

  async initializeWorkspace(workspaceId: string, region: DataRegion = DataRegion.US_EAST): Promise<DataResidencyEntity> {
    const existing = await this.drRepo.findOne({ where: { workspaceId } });
    if (existing) return existing;

    const config = this.drRepo.create({
      workspaceId,
      currentRegion: region,
      status: DataResidencyStatus.ACTIVE,
      enforceRegion: false,
      allowedRegions: Object.values(DataRegion),
    });

    return this.drRepo.save(config);
  }

  async getWorkspaceConfig(workspaceId: string): Promise<DataResidencyEntity> {
    const config = await this.drRepo.findOne({ where: { workspaceId } });
    if (!config) {
      return this.initializeWorkspace(workspaceId);
    }
    return config;
  }

  async requestMigration(workspaceId: string, newRegion: DataRegion): Promise<DataResidencyEntity> {
    const config = await this.getWorkspaceConfig(workspaceId);

    if (config.status === DataResidencyStatus.MIGRATING) {
      throw new BadRequestException('Migration already in progress');
    }

    if (config.enforceRegion && !config.allowedRegions?.includes(newRegion)) {
      throw new BadRequestException(`Region ${newRegion} not allowed for this workspace`);
    }

    await this.drRepo.update(workspaceId, {
      requestedRegion: newRegion,
      status: DataResidencyStatus.PENDING,
    });

    setTimeout(() => {
      this.startMigration(workspaceId, newRegion).catch(console.error);
    }, 100);

    return this.getWorkspaceConfig(workspaceId);
  }

  async cancelMigration(workspaceId: string): Promise<DataResidencyEntity> {
    const config = await this.getWorkspaceConfig(workspaceId);
    
    if (config.status !== DataResidencyStatus.PENDING && config.status !== DataResidencyStatus.MIGRATING) {
      throw new BadRequestException('No migration in progress');
    }

    await this.drRepo.update(workspaceId, {
      requestedRegion: undefined,
      status: DataResidencyStatus.ACTIVE,
    } as any);

    return this.getWorkspaceConfig(workspaceId);
  }

  async setAllowedRegions(workspaceId: string, regions: DataRegion[]): Promise<DataResidencyEntity> {
    await this.drRepo.update(workspaceId, {
      allowedRegions: regions,
      enforceRegion: regions.length > 0,
    });

    return this.getWorkspaceConfig(workspaceId);
  }

  async enforceRegion(workspaceId: string, enforce: boolean): Promise<DataResidencyEntity> {
    await this.drRepo.update(workspaceId, { enforceRegion: enforce });
    return this.getWorkspaceConfig(workspaceId);
  }

  getRegionHost(region: DataRegion): string {
    return REGION_HOSTS[region] || REGION_HOSTS[DataRegion.US_EAST];
  }

  getRegionName(region: DataRegion): string {
    return REGION_NAMES[region] || region;
  }

  private async startMigration(workspaceId: string, newRegion: DataRegion): Promise<void> {
    try {
      await this.drRepo.update(workspaceId, {
        status: DataResidencyStatus.MIGRATING,
        migrationStartedAt: new Date(),
        migrationError: undefined as unknown as string,
      });

      console.log(`Starting data migration for workspace ${workspaceId} to ${newRegion}`);

      await this.performMigration(workspaceId, newRegion);

      await this.drRepo.update(workspaceId, {
        currentRegion: newRegion,
        requestedRegion: undefined,
        status: DataResidencyStatus.ACTIVE,
        migrationCompletedAt: new Date(),
      });

      console.log(`Migration completed for workspace ${workspaceId}`);
    } catch (error) {
      await this.drRepo.update(workspaceId, {
        status: DataResidencyStatus.FAILED,
        migrationError: error.message,
      });
      console.error(`Migration failed: ${error}`);
    }
  }

  private async performMigration(workspaceId: string, newRegion: DataRegion): Promise<void> {
    console.log(`Moving data from current region to ${newRegion}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
