import { Injectable } from '@nestjs/common';

import { capitalize, isDefined } from 'twenty-shared/utils';

import { DEFAULT_TIMELINE_PROJECTION_RULES } from 'src/engine/core-modules/timeline-feed/constants/default-timeline-projection-rules.constant';
import { TimelineProjectionRuleEntity } from 'src/engine/core-modules/timeline-feed/timeline-projection-rule.entity';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ResolvedTimelineProjectionRule = {
  sourceObjectNameSingular: string;
  targetColumnName: string;
  linkedObjectMetadataIds: string[];
};

const getTargetColumnName = (sourceObjectNameSingular: string): string =>
  `target${capitalize(sourceObjectNameSingular)}Id`;

@Injectable()
export class TimelineProjectionPolicyProvider {
  constructor(
    @InjectWorkspaceScopedRepository(TimelineProjectionRuleEntity)
    private readonly timelineProjectionRuleRepository: WorkspaceScopedRepository<TimelineProjectionRuleEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getResolvedRules({
    workspaceId,
    anchorObjectNameSingular,
  }: {
    workspaceId: string;
    anchorObjectNameSingular: string;
  }): Promise<ResolvedTimelineProjectionRule[]> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );
    const nameSingularById = Object.fromEntries(
      Object.entries(idByNameSingular).map(([name, id]) => [id, name]),
    );

    const anchorObjectMetadataId = idByNameSingular[anchorObjectNameSingular];

    const customRules =
      await this.timelineProjectionRuleRepository.find(workspaceId);

    // Merge defaults + workspace rules into one clause per source column, so the
    // feed gets a single OR clause per inherited record type.
    const linkedIdsByColumn = new Map<
      string,
      { sourceObjectNameSingular: string; linkedObjectMetadataIds: Set<string> }
    >();

    const addRule = (
      sourceObjectNameSingular: string,
      linkedObjectMetadataIds: string[],
    ) => {
      if (sourceObjectNameSingular === anchorObjectNameSingular) {
        return;
      }

      const definedLinkedIds = linkedObjectMetadataIds.filter((id) =>
        isDefined(nameSingularById[id]),
      );

      if (definedLinkedIds.length === 0) {
        return;
      }

      const targetColumnName = getTargetColumnName(sourceObjectNameSingular);
      const entry = linkedIdsByColumn.get(targetColumnName) ?? {
        sourceObjectNameSingular,
        linkedObjectMetadataIds: new Set<string>(),
      };

      definedLinkedIds.forEach((id) => entry.linkedObjectMetadataIds.add(id));
      linkedIdsByColumn.set(targetColumnName, entry);
    };

    for (const defaultRule of DEFAULT_TIMELINE_PROJECTION_RULES) {
      addRule(
        defaultRule.sourceObjectNameSingular,
        defaultRule.linkedObjectNameSingulars
          .map((nameSingular) => idByNameSingular[nameSingular])
          .filter(isDefined),
      );
    }

    for (const customRule of customRules) {
      if (customRule.anchorObjectMetadataId !== anchorObjectMetadataId) {
        continue;
      }

      const sourceObjectNameSingular =
        nameSingularById[customRule.sourceObjectMetadataId];

      if (!isDefined(sourceObjectNameSingular)) {
        continue;
      }

      addRule(sourceObjectNameSingular, customRule.linkedObjectMetadataIds);
    }

    return [...linkedIdsByColumn.entries()].map(
      ([
        targetColumnName,
        { sourceObjectNameSingular, linkedObjectMetadataIds },
      ]) => ({
        sourceObjectNameSingular,
        targetColumnName,
        linkedObjectMetadataIds: [...linkedObjectMetadataIds],
      }),
    );
  }
}
