import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795523227174)
export class AddSourceFieldToFieldPermissionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldPermission" ADD "sourceFieldMetadataId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_ec49745645153cbb32ff67f9a92" FOREIGN KEY ("sourceFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_ec49745645153cbb32ff67f9a92"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."fieldPermission" DROP COLUMN "sourceFieldMetadataId"',
    );
  }
}
