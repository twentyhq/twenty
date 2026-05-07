import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1778200000000)
export class AddWorkspaceSubdomainIndexFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_WORKSPACE_SUBDOMAIN" ON "core"."workspace" ("subdomain")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX CONCURRENTLY IF EXISTS "core"."IDX_WORKSPACE_SUBDOMAIN"',
    );
  }
}
