import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1782281874768)
export class AddPrimaryPublicDomainToApplicationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD "primaryPublicDomainId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD CONSTRAINT "FK_38ac5dccee353ca07862a5a94bf" FOREIGN KEY ("primaryPublicDomainId") REFERENCES "core"."publicDomain"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP CONSTRAINT "FK_38ac5dccee353ca07862a5a94bf"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP COLUMN "primaryPublicDomainId"',
    );
  }
}
