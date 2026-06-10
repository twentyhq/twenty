import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.9.0', 1780088214774)
export class AddEmailingDomainUnsubscribeHostFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD "unsubscribeHostname" character varying');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD "unsubscribeHostnameId" character varying');
    await queryRunner.query('CREATE TYPE "core"."emailingDomain_unsubscribehostnamestatus_enum" AS ENUM(\'PENDING\', \'ACTIVE\', \'FAILED\')');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD "unsubscribeHostnameStatus" "core"."emailingDomain_unsubscribehostnamestatus_enum"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP COLUMN "unsubscribeHostnameStatus"');
    await queryRunner.query('DROP TYPE "core"."emailingDomain_unsubscribehostnamestatus_enum"');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP COLUMN "unsubscribeHostnameId"');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP COLUMN "unsubscribeHostname"');
  }
}
