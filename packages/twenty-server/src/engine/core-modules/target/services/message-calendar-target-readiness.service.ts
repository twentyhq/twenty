import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  getTargetFieldNameForObjectRecord,
  type TargetFilter,
} from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class MessageCalendarTargetReadinessService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async resolveTargetFilter({
    objectNameSingular,
    recordId,
    workspaceId,
  }: {
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
  }): Promise<TargetFilter | undefined> {
    const fieldName = getTargetFieldNameForObjectRecord(objectNameSingular);

    if (!isDefined(fieldName) || !(await this.isReady(workspaceId))) {
      return undefined;
    }

    return { fieldName, recordId };
  }

  async isReady(workspaceId: string): Promise<boolean> {
    // During workspace upgrades the target objects may not exist yet;
    // retain legacy reads until metadata sync creates both junctions.
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return [
      STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
      STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier],
      ),
    );
  }
}
