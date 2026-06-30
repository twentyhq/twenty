import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  AdminPanelException,
  AdminPanelExceptionCode,
} from 'src/engine/core-modules/admin-panel/admin-panel.exception';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';

import {
  MAINTENANCE_MODE_BANNER_DISMISSED_KEY,
  type MaintenanceModeBannerKeyValueTypeMap,
} from './types/maintenance-mode-banner-key-value.type';

const MAINTENANCE_MODE_KEY = 'MAINTENANCE_MODE';

type MaintenanceModeValue = {
  startAt: string;
  endAt: string;
  link?: string;
};

type MaintenanceModeKeyValueTypeMap = {
  [MAINTENANCE_MODE_KEY]: MaintenanceModeValue;
};

@Injectable()
export class MaintenanceModeService {
  constructor(
    private readonly keyValuePairService: KeyValuePairService<MaintenanceModeKeyValueTypeMap>,
    private readonly userVarsService: UserVarsService<MaintenanceModeBannerKeyValueTypeMap>,
  ) {}

  private async clearMaintenanceModeBannerDismissals(): Promise<void> {
    await this.userVarsService.delete({
      key: MAINTENANCE_MODE_BANNER_DISMISSED_KEY,
    });
  }

  async getMaintenanceMode(): Promise<MaintenanceModeValue | null> {
    const maintenanceModeKeyValuePairs = await this.keyValuePairService.get({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
    });

    if (maintenanceModeKeyValuePairs.length === 0) {
      return null;
    }

    const value = (
      maintenanceModeKeyValuePairs[0] as {
        value?: MaintenanceModeKeyValueTypeMap[typeof MAINTENANCE_MODE_KEY];
      }
    )?.value;

    if (
      !isDefined(value) ||
      !isNonEmptyString(value.startAt) ||
      !isNonEmptyString(value.endAt)
    ) {
      return null;
    }

    return value;
  }

  async setMaintenanceMode(value: MaintenanceModeValue): Promise<void> {
    if (new Date(value.endAt) <= new Date(value.startAt)) {
      throw new AdminPanelException(
        'Maintenance mode end date must be after start date',
        AdminPanelExceptionCode.INVALID_MAINTENANCE_MODE_TIME_RANGE,
      );
    }

    await this.clearMaintenanceModeBannerDismissals();

    await this.keyValuePairService.set({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
      value,
    });
  }

  async clearMaintenanceMode(): Promise<void> {
    await this.clearMaintenanceModeBannerDismissals();

    await this.keyValuePairService.delete({
      userId: null,
      workspaceId: null,
      type: KeyValuePairType.CONFIG_VARIABLE,
      key: MAINTENANCE_MODE_KEY,
    });
  }

  async isMaintenanceModeBannerDismissed(
    userId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const isDismissed = await this.userVarsService.get({
      userId,
      workspaceId,
      key: MAINTENANCE_MODE_BANNER_DISMISSED_KEY,
    });

    return isDismissed === true;
  }

  async dismissMaintenanceModeBanner(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.userVarsService.set({
      userId,
      workspaceId,
      key: MAINTENANCE_MODE_BANNER_DISMISSED_KEY,
      value: true,
    });
  }
}
