import { Injectable } from '@nestjs/common';

import { isNumber } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { sanitizeNumber } from 'src/engine/utils/sanitize-number.utli';

export type RecordPositionServiceCreateArgs = {
  value: number | 'first' | 'last';
  objectMetadata: { isCustom: boolean; nameSingular: string };
  workspaceId: string;
  index?: number;
};

@Injectable()
export class RecordPositionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async buildRecordPosition({
    objectMetadata,
    value,
    workspaceId,
    index = 0,
  }: RecordPositionServiceCreateArgs): Promise<number> {
    if (isNumber(value) && !Number.isNaN(value)) {
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

    const numericPositions = recordsWithExistingNumberPosition
      .map((record) => record.position)
      .filter((position) => isNumber(position) && !Number.isNaN(position));

    const calculatePosition = (
      mathOperation: (positions: number[], existingPosition: number) => number,
      existingPosition: number | null,
    ): number => {
      const sanitizedExistingPosition =
        isDefined(existingPosition) && !Number.isNaN(existingPosition)
          ? existingPosition
          : null;

      const fallback = sanitizedExistingPosition ?? 1;

      return numericPositions.length > 0
        ? mathOperation(numericPositions, fallback)
        : fallback;
    };

    if (recordsThatNeedFirstPosition.length > 0) {
      const existingRecordMinPosition = await this.findMinPosition(
        objectMetadata,
        workspaceId,
      );

      const minPosition = calculatePosition(
        (positions, fallback) => Math.min(...positions, fallback),
        existingRecordMinPosition,
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

      const maxPosition = calculatePosition(
        (positions, fallback) => Math.max(...positions, fallback),
        existingRecordMaxPosition,
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
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const repository = await this.globalWorkspaceOrmManager.getRepository(
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
      },
    );
  }

  async updatePosition(
    recordId: string,
    positionValue: number,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const repository = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          objectMetadata.nameSingular,
          {
            shouldBypassPermissionChecks: true,
          },
        );

        await repository.update(recordId, {
          position: positionValue,
        });
      },
    );
  }

  private async findMinPosition(
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
  ): Promise<number | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    const result =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const repository = await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            objectMetadata.nameSingular,
            {
              shouldBypassPermissionChecks: true,
            },
          );

          return await repository.minimum('position');
        },
      );

    return sanitizeNumber(result);
  }

  private async findMaxPosition(
    objectMetadata: { isCustom: boolean; nameSingular: string },
    workspaceId: string,
  ): Promise<number | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    const result =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const repository = await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            objectMetadata.nameSingular,
            {
              shouldBypassPermissionChecks: true,
            },
          );

          return await repository.maximum('position');
        },
      );

    return sanitizeNumber(result);
  }
}
