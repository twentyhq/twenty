import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

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

  async overridePositionOnRecords({
    records,
    workspaceId,
    objectMetadata,
  }: {
    records: Partial<ObjectRecord>[];
    workspaceId: string;
    objectMetadata: { isCustom: boolean; nameSingular: string };
  }): Promise<Partial<ObjectRecord>[]> {
    const recordsWithFirstPosition: Partial<ObjectRecord>[] = [];
    const recordsWithLastPosition: Partial<ObjectRecord>[] = [];
    const recordsWithPosition: Partial<ObjectRecord>[] = [];

    for (const record of records) {
      if (record.position === 'last') {
        recordsWithLastPosition.push(record);
      } else if (typeof record.position === 'number') {
        recordsWithPosition.push(record);
      } else {
        recordsWithFirstPosition.push(record);
      }
    }

    if (recordsWithFirstPosition.length > 0) {
      const minPosition = Math.min(
        ...recordsWithPosition.map((record) => record.position),
        (await this.findMinPosition(objectMetadata, workspaceId)) || 1,
      );

      for (const [index, record] of recordsWithFirstPosition.entries()) {
        record.position = minPosition - index - 1;
      }
    }

    if (recordsWithLastPosition.length > 0) {
      const maxPosition = Math.max(
        ...recordsWithPosition.map((record) => record.position),
        (await this.findMaxPosition(objectMetadata, workspaceId)) || 1,
      );

      for (const [index, record] of recordsWithLastPosition.entries()) {
        record.position = maxPosition + index + 1;
      }
    }

    return [
      ...recordsWithFirstPosition,
      ...recordsWithLastPosition,
      ...recordsWithPosition,
    ];
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
