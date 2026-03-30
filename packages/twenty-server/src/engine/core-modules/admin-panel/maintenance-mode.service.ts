import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';

import { type MaintenanceModeValue } from './types/maintenance-mode-value.type';

const MAINTENANCE_MODE_KEY = 'MAINTENANCE_MODE';

@Injectable()
export class MaintenanceModeService {
  constructor(private readonly keyValuePairService: KeyValuePairService) {}

  async getMaintenanceMode(): Promise<MaintenanceModeValue | null> {
    const results = await this.keyValuePairService.get({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
    });

    if (results.length === 0) {
      return null;
    }

    const value = results[0]?.value;

    if (
      !isDefined(value) ||
      !isNonEmptyString(value.startAt) ||
      !isNonEmptyString(value.endAt)
    ) {
      return null;
    }

    return value as MaintenanceModeValue;
  }

  async setMaintenanceMode(value: MaintenanceModeValue): Promise<void> {
    if (new Date(value.endAt) <= new Date(value.startAt)) {
      throw new BadRequestException('endAt must be after startAt');
    }

    await this.keyValuePairService.set({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
      value,
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
