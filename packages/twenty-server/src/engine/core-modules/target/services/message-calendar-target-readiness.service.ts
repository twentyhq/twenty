import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  getTargetFieldNameForObjectRecord,
  type TargetFilter,
} from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class MessageCalendarTargetReadinessService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

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
    const isReadEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_MESSAGE_CALENDAR_TARGET_READ_ENABLED,
      workspaceId,
    );

    if (!isReadEnabled) {
      return false;
    }

    // A premature flag flip on a workspace whose metadata sync has not run
    // must degrade to legacy reads, not break the timeline relation join.
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
