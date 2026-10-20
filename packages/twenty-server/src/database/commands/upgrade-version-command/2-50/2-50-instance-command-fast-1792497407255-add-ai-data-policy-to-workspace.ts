import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.50.0', 1792497407255)
export class AddAiDataPolicyToWorkspaceFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiDataResidency" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "isAiZeroDataRetentionRequired" boolean NOT NULL DEFAULT false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "isAiZeroDataRetentionRequired"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiDataResidency"',
    );
  }
}
