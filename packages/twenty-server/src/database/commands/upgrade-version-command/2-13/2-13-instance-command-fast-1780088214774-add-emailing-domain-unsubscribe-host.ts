import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.13.0', 1780088214774)
export class AddEmailingDomainUnsubscribeHostFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD COLUMN IF NOT EXISTS "unsubscribeHostname" character varying');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD COLUMN IF NOT EXISTS "unsubscribeHostnameId" character varying');
    await queryRunner.query('DO $$ BEGIN CREATE TYPE "core"."emailingDomain_unsubscribehostnamestatus_enum" AS ENUM(\'PENDING\', \'ACTIVE\', \'FAILED\'); EXCEPTION WHEN duplicate_object THEN null; END $$');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" ADD COLUMN IF NOT EXISTS "unsubscribeHostnameStatus" "core"."emailingDomain_unsubscribehostnamestatus_enum"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP COLUMN IF EXISTS "unsubscribeHostnameStatus"');
    await queryRunner.query('DROP TYPE IF EXISTS "core"."emailingDomain_unsubscribehostnamestatus_enum"');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP COLUMN IF EXISTS "unsubscribeHostnameId"');
    await queryRunner.query('ALTER TABLE "core"."emailingDomain" DROP COLUMN IF EXISTS "unsubscribeHostname"');
  }
}
