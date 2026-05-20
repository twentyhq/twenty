import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.7.0', 1778865501791)
export class UniqueEmailingDomainGloballyFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP CONSTRAINT "IDX_EMAILING_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD CONSTRAINT "UQ_c08c841c3a94aecaa58f5c9ce0d" UNIQUE ("domain")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP CONSTRAINT "UQ_c08c841c3a94aecaa58f5c9ce0d"');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD CONSTRAINT "IDX_EMAILING_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE" UNIQUE ("domain", "workspaceId")');
  }
}
