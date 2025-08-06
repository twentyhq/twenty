import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

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
    partialRecordInputs,
    workspaceId,
    objectMetadata,
    shouldBackfillPositionIfUndefined,
  }: {
    partialRecordInputs: Partial<ObjectRecord>[];
    workspaceId: string;
    objectMetadata: {
      isCustom: boolean;
      nameSingular: string;
      fieldIdByName: Record<string, string>;
    };
    shouldBackfillPositionIfUndefined: boolean;
  }): Promise<Partial<ObjectRecord>[]> {
    const recordsThatNeedFirstPosition: Partial<ObjectRecord>[] = [];
    const recordsThatNeedLastPosition: Partial<ObjectRecord>[] = [];
    const recordsWithExistingNumberPosition: Partial<ObjectRecord>[] = [];
    const recordsThatShouldNotBeUpdated: Partial<ObjectRecord>[] = [];

    const positionFieldId = objectMetadata.fieldIdByName['position'];

    if (!isDefined(positionFieldId)) {
      return partialRecordInputs;
    }

    for (const partialRecordInput of partialRecordInputs) {
      if (partialRecordInput.position === 'last') {
        recordsThatNeedLastPosition.push(partialRecordInput);
      } else if (typeof partialRecordInput.position === 'number') {
        recordsWithExistingNumberPosition.push(partialRecordInput);
      } else if (partialRecordInput.position === 'first') {
        recordsThatNeedFirstPosition.push(partialRecordInput);
      } else if (
        partialRecordInput.position === undefined &&
        shouldBackfillPositionIfUndefined
      ) {
        recordsThatNeedFirstPosition.push(partialRecordInput);
      } else {
        recordsThatShouldNotBeUpdated.push(partialRecordInput);
      }
    }

    if (recordsThatNeedFirstPosition.length > 0) {
      const existingRecordMinPosition = await this.findMinPosition(
        objectMetadata,
        workspaceId,
      );

      const minPosition = Math.min(
        ...recordsWithExistingNumberPosition.map((record) => record.position),
        isDefined(existingRecordMinPosition) ? existingRecordMinPosition : 1,
      );

      for (const [index, record] of recordsThatNeedFirstPosition.entries()) {
        record.position = minPosition - index - 1;
      }
    }

    if (recordsThatNeedLastPosition.length > 0) {
      const existingRecordMaxPosition = await this.findMaxPosition(
        objectMetadata,
        workspaceId,
      );

      const maxPosition = Math.max(
        ...recordsThatNeedLastPosition.map((record) => record.position),
        isDefined(existingRecordMaxPosition) ? existingRecordMaxPosition : 1,
      );

      for (const [index, record] of recordsThatNeedLastPosition.entries()) {
        record.position = maxPosition + index + 1;
      }
    }

    return [
      ...recordsThatNeedFirstPosition,
      ...recordsThatNeedLastPosition,
      ...recordsWithExistingNumberPosition,
      ...recordsThatShouldNotBeUpdated,
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

    return await repository.minimum('position');
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

    return await repository.maximum('position');
  }
}
