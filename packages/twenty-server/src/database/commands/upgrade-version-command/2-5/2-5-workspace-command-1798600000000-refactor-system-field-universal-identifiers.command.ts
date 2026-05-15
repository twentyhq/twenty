import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { computeSystemFieldUniversalIdentifier } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Names of the eight standard system fields scaffolded by
// `buildDefaultFlatFieldMetadatasForCustomObject` for every custom object.
// Anything outside this set is left untouched, even if `isSystem = true`
// (e.g. relation-source fields the SDK marks system but doesn't scaffold).
const SYSTEM_FIELD_NAMES_TO_REFACTOR = Object.values(
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS,
).map((field) => field.name);

type SystemFieldRow = {
  id: string;
  current_universal_identifier: string;
  object_metadata_universal_identifier: string;
  name: string;
};

@RegisteredWorkspaceCommand('2.5.0', 1798600000000)
@Command({
  name: 'upgrade:2-5:refactor-system-field-universal-identifiers',
  description:
    'Rewrite system field universalIdentifiers to v5(`${objectMetadataUniversalIdentifier}/${name}`, SYSTEM_FIELD_UUID_NAMESPACE) so app-install diffs do not see them as changed rows.',
})
export class RefactorSystemFieldUniversalIdentifiersCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!dataSource) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const rows: SystemFieldRow[] = await dataSource.query(
      `SELECT fm.id,
              fm."universalIdentifier" AS current_universal_identifier,
              om."universalIdentifier" AS object_metadata_universal_identifier,
              fm.name
         FROM core."fieldMetadata" fm
         JOIN core."objectMetadata" om ON om.id = fm."objectMetadataId"
        WHERE fm."workspaceId" = $1
          AND fm."isSystem" = true
          AND fm.name = ANY($2)`,
      [workspaceId, SYSTEM_FIELD_NAMES_TO_REFACTOR],
    );

    if (rows.length === 0) {
      this.logger.log(
        `No system fields to refactor for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const updates = rows
      .map((row) => ({
        id: row.id,
        from: row.current_universal_identifier,
        to: computeSystemFieldUniversalIdentifier({
          objectMetadataUniversalIdentifier:
            row.object_metadata_universal_identifier,
          name: row.name,
        }),
        name: row.name,
      }))
      .filter((row) => row.from !== row.to);

    if (updates.length === 0) {
      this.logger.log(
        `All ${rows.length} system field universalIdentifiers already match the v5 derivation for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would rewrite ${updates.length}/${rows.length} system field universalIdentifier(s) for workspace ${workspaceId}: ${updates
          .map((u) => `${u.name}@${u.id} ${u.from} -> ${u.to}`)
          .slice(0, 5)
          .join(', ')}${updates.length > 5 ? ', ...' : ''}`,
      );

      return;
    }

    // We update one row at a time with the FK-safe SET universalIdentifier
    // — universalIdentifier is purely the cross-workspace flat-entity
    // identifier; no DB foreign key references it (other tables join on
    // the per-workspace `id` PK), so a plain UPDATE is safe.
    //
    // The unique index `(workspaceId, universalIdentifier)` is preserved
    // because v5(`${objectMetadataUniversalIdentifier}/${name}`, NAMESPACE)
    // is unique per (object, field name) — and a given workspace cannot
    // host two custom objects with the same universalIdentifier.
    let updatedCount = 0;

    for (const update of updates) {
      await dataSource.query(
        `UPDATE core."fieldMetadata"
            SET "universalIdentifier" = $2,
                "updatedAt" = NOW()
          WHERE id = $1`,
        [update.id, update.to],
      );
      updatedCount += 1;
    }

    this.logger.log(
      `Refactored ${updatedCount} system field universalIdentifier(s) to v5 for workspace ${workspaceId}`,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);
  }
}

export const _SYSTEM_FIELD_NAMES_TO_REFACTOR_FOR_TEST =
  SYSTEM_FIELD_NAMES_TO_REFACTOR;
