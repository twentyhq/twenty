import { type Manifest } from 'twenty-shared/application';
import { DataSource, QueryRunner } from 'typeorm';

import {
  applyUniversalIdentifierReplacements,
  computeManifestDefaultFieldUniversalIdentifierReplacements,
} from 'src/database/commands/upgrade-version-command/2-19/utils/compute-manifest-default-field-universal-identifier-replacements.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Rewrites SDK auto-generated default field universal identifiers (system
// fields and default relation fields) stored in application registration
// manifests from the legacy SDK derivation to the deterministic
// getFieldUniversalIdentifier derivation, keeping manifests aligned with the
// per-workspace fieldMetadata backfill.
@RegisteredInstanceCommand('2.19.0', 1783099000000, { type: 'slow' })
export class BackfillDeterministicFieldUniversalIdentifiersInManifestsSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await this.rewriteManifests(
      (query, parameters) => dataSource.query(query, parameters),
      'legacy-to-deterministic',
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.rewriteManifests(
      (query, parameters) => queryRunner.query(query, parameters),
      'deterministic-to-legacy',
    );
  }

  private async rewriteManifests(
    executeQuery: (
      query: string,
      parameters?: unknown[],
    ) => Promise<{ id: string; manifest: Manifest }[]>,
    direction: 'legacy-to-deterministic' | 'deterministic-to-legacy',
  ): Promise<void> {
    const registrations = await executeQuery(
      `SELECT "id", "manifest" FROM "core"."applicationRegistration" WHERE "manifest" IS NOT NULL`,
    );

    for (const { id, manifest } of registrations) {
      const replacements =
        computeManifestDefaultFieldUniversalIdentifierReplacements(
          manifest,
        ).map((replacement) =>
          direction === 'legacy-to-deterministic'
            ? replacement
            : {
                legacyUniversalIdentifier:
                  replacement.deterministicUniversalIdentifier,
                deterministicUniversalIdentifier:
                  replacement.legacyUniversalIdentifier,
              },
        );

      const { updatedManifest, appliedReplacementCount } =
        applyUniversalIdentifierReplacements({ manifest, replacements });

      if (appliedReplacementCount === 0) {
        continue;
      }

      await executeQuery(
        `UPDATE "core"."applicationRegistration" SET "manifest" = $1 WHERE "id" = $2`,
        [JSON.stringify(updatedManifest), id],
      );
    }
  }
}
