import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.31.0', 1786442719438)
export class AddFrontComponentSharedDependenciesToApplicationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD COLUMN IF NOT EXISTS "frontComponentSharedDependenciesChecksum" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD COLUMN IF NOT EXISTS "frontComponentSharedDependenciesBuiltPath" text',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP COLUMN IF EXISTS "frontComponentSharedDependenciesChecksum"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP COLUMN IF EXISTS "frontComponentSharedDependenciesBuiltPath"',
    );
  }
}
