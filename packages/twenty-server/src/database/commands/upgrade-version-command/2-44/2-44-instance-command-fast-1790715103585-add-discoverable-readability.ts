import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.44.0', 1790715103585)
export class AddDiscoverableReadabilityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ADD "discoverableFieldUniversalIdentifiers" uuid array');
    await queryRunner.query('ALTER TYPE "core"."objectMetadata_readability_enum" RENAME TO "objectMetadata_readability_enum_old"');
    await queryRunner.query('CREATE TYPE "core"."objectMetadata_readability_enum" AS ENUM(\'OPEN\', \'PRIVATE\', \'DISCOVERABLE\', \'INHERITED\', \'APPLICATION\', \'SYSTEM\')');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ALTER COLUMN "readability" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ALTER COLUMN "readability" TYPE "core"."objectMetadata_readability_enum" USING "readability"::"text"::"core"."objectMetadata_readability_enum"');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ALTER COLUMN "readability" SET DEFAULT \'OPEN\'');
    await queryRunner.query('DROP TYPE "core"."objectMetadata_readability_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."objectMetadata_readability_enum_old" AS ENUM(\'APPLICATION\', \'INHERITED\', \'OPEN\', \'PRIVATE\', \'SYSTEM\')');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ALTER COLUMN "readability" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ALTER COLUMN "readability" TYPE "core"."objectMetadata_readability_enum_old" USING "readability"::"text"::"core"."objectMetadata_readability_enum_old"');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ALTER COLUMN "readability" SET DEFAULT \'OPEN\'');
    await queryRunner.query('DROP TYPE "core"."objectMetadata_readability_enum"');
    await queryRunner.query('ALTER TYPE "core"."objectMetadata_readability_enum_old" RENAME TO "objectMetadata_readability_enum"');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" DROP COLUMN "discoverableFieldUniversalIdentifiers"');
  }
}
