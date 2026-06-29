import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.18.0', 1810000000000)
export class MakeSearchFieldMetadataFksDeferrableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT IF EXISTS "FK_1b78544eb06f82059a2a01013a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_1b78544eb06f82059a2a01013a3" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT IF EXISTS "FK_6d5c6922bfd1578b1eff2abb9d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_6d5c6922bfd1578b1eff2abb9d6" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT IF EXISTS "FK_31102b31f7338b6a298fc22996a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_31102b31f7338b6a298fc22996a" FOREIGN KEY ("tsVectorFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT IF EXISTS "FK_31102b31f7338b6a298fc22996a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_31102b31f7338b6a298fc22996a" FOREIGN KEY ("tsVectorFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT IF EXISTS "FK_6d5c6922bfd1578b1eff2abb9d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_6d5c6922bfd1578b1eff2abb9d6" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT IF EXISTS "FK_1b78544eb06f82059a2a01013a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_1b78544eb06f82059a2a01013a3" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
