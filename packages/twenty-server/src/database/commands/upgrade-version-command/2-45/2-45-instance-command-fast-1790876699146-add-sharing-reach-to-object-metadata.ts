import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.45.0', 1790876699146)
export class AddSharingReachToObjectMetadataFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."objectMetadata_sharingreach_enum" AS ENUM(\'ROLE_ACCESS\', \'WORKSPACE\')');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ADD "sharingReach" "core"."objectMetadata_sharingreach_enum" NOT NULL DEFAULT \'WORKSPACE\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" DROP COLUMN "sharingReach"');
    await queryRunner.query('DROP TYPE "core"."objectMetadata_sharingreach_enum"');
  }
}
