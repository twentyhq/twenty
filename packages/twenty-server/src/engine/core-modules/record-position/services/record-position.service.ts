import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export type RecordPositionServiceCreateArgs = {
  value: number | 'first' | 'last';
  objectMetadata: { isCustom: boolean; nameSingular: string };
  workspaceId: string;
  index?: number;
};

@Injectable()
export class RecordPositionService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async buildRecordPosition({
    objectMetadata,
    value,
    workspaceId,
    index = 0,
  }: RecordPositionServiceCreateArgs): Promise<number> {
    if (typeof value === 'number') {
      return value;
    }

    if (value === 'first') {
      const recordWithMinPosition = await this.findMinPosition(
        objectMetadata,
        workspaceId,
      );

      return recordWithMinPosition !== null
        ? recordWithMinPosition - index - 1
        : 1;
    }

    const recordWithMaxPosition = await this.findMaxPosition(
      objectMetadata,
      workspaceId,
    );

    return recordWithMaxPosition !== null
      ? recordWithMaxPosition + index + 1
      : 1;
  }

  async findByPosition(
    positionValue: number | null,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
  ): Promise<{ id: string; position: number } | null> {
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        objectMetadata.nameSingular,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const record = await repository.findOneBy({
      position: positionValue,
    });

    return record ? { id: record.id, position: record.position } : null;
  }

  async updatePosition(
    recordId: string,
    positionValue: number,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
  ): Promise<void> {
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        objectMetadata.nameSingular,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    await repository.update(recordId, {
      position: positionValue,
    });
  }

  private async findMinPosition(
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
  ): Promise<number | null> {
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        objectMetadata.nameSingular,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    return repository.minimum('position');
  }

  private async findMaxPosition(
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
  ): Promise<number | null> {
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        objectMetadata.nameSingular,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    return repository.maximum('position');
  }
}
