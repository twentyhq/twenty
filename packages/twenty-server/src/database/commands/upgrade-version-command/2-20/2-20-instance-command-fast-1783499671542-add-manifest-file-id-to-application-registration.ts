import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783499671542)
export class AddManifestFileIdToApplicationRegistrationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" ADD "manifestFileId" uuid');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "UQ_013bed14ac092b0e62c6aabb485" UNIQUE ("manifestFileId")');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "FK_013bed14ac092b0e62c6aabb485" FOREIGN KEY ("manifestFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT "FK_013bed14ac092b0e62c6aabb485"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT "UQ_013bed14ac092b0e62c6aabb485"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" DROP COLUMN "manifestFileId"');
  }
}
