import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1798000003000)
export class AddApplicationIdToPublicDomainFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."publicDomain" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PUBLIC_DOMAIN_APPLICATION_ID" ON "core"."publicDomain" ("applicationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."publicDomain" ADD CONSTRAINT "FK_39f1ad35993f3994cd5400e81a0" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."publicDomain" DROP CONSTRAINT "FK_39f1ad35993f3994cd5400e81a0"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PUBLIC_DOMAIN_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."publicDomain" DROP COLUMN "applicationId"`,
    );
  }
}
