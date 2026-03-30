import { Injectable } from '@nestjs/common';

import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';

const MAINTENANCE_MODE_KEY = 'MAINTENANCE_MODE';

export type MaintenanceModeValue = {
  startAt: string;
  endAt: string;
  link?: string;
};

@Injectable()
export class MaintenanceModeService {
  constructor(private readonly keyValuePairService: KeyValuePairService) {}

  async getMaintenanceMode(): Promise<MaintenanceModeValue | null> {
    const results = await this.keyValuePairService.get<
      typeof MAINTENANCE_MODE_KEY
    >({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
    });

    if (results.length === 0) {
      return null;
    }

    const row = results[0] as unknown as KeyValuePairEntity;
    const value = row.value as unknown as MaintenanceModeValue | null;

    if (!value || !value.startAt || !value.endAt) {
      return null;
    }

    return value;
  }

  async setMaintenanceMode(value: MaintenanceModeValue): Promise<void> {
    await this.keyValuePairService.set({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
      value: value as unknown as JSON,
    });
  }

  async clearMaintenanceMode(): Promise<void> {
    await this.keyValuePairService.delete({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
    });
  }
}
