import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Replaces the negative isUIReadOnly flag with the positive isUIEditable flag
// (inverted polarity) on both objectMetadata and fieldMetadata, and adds the
// object-level isUICreatable flag.
@RegisteredInstanceCommand('2.13.0', 1781277453604)
export class RenameIsUiReadOnlyToIsUiEditableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "isUIEditable" boolean NOT NULL DEFAULT true',
    );
    await queryRunner.query(
      `UPDATE "core"."objectMetadata" SET "isUIEditable" = false WHERE "isUIReadOnly" = true`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "isUIReadOnly"',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "isUICreatable" boolean NOT NULL DEFAULT true',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" ADD COLUMN IF NOT EXISTS "isUIEditable" boolean NOT NULL DEFAULT true',
    );
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata" SET "isUIEditable" = false WHERE "isUIReadOnly" = true`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN IF EXISTS "isUIReadOnly"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" ADD COLUMN IF NOT EXISTS "isUIReadOnly" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata" SET "isUIReadOnly" = true WHERE "isUIEditable" = false`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN IF EXISTS "isUIEditable"',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "isUICreatable"',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "isUIReadOnly" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      `UPDATE "core"."objectMetadata" SET "isUIReadOnly" = true WHERE "isUIEditable" = false`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "isUIEditable"',
    );
  }
}
