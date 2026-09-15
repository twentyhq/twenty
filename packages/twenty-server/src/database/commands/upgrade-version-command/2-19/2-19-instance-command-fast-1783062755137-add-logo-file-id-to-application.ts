import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783062755137)
export class AddLogoFileIdToApplicationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD "logoFileId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD CONSTRAINT "UQ_3d6ee2b75b81933c1708918f647" UNIQUE ("logoFileId")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD CONSTRAINT "FK_3d6ee2b75b81933c1708918f647" FOREIGN KEY ("logoFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP CONSTRAINT "FK_3d6ee2b75b81933c1708918f647"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP CONSTRAINT "UQ_3d6ee2b75b81933c1708918f647"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP COLUMN "logoFileId"',
    );
  }
}
