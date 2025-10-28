import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class SetServerlessFunctionIdInTriggersNonNullable1759417994272
  implements MigrationInterface
{
  name = 'SetServerlessFunctionIdInTriggersNonNullable1759417994272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ALTER COLUMN "serverlessFunctionId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ALTER COLUMN "serverlessFunctionId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" DROP CONSTRAINT "FK_c63b1110bbf09051be2f495d0be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" ALTER COLUMN "serverlessFunctionId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" ADD CONSTRAINT "FK_c63b1110bbf09051be2f495d0be" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."route" DROP CONSTRAINT "FK_c63b1110bbf09051be2f495d0be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" ALTER COLUMN "serverlessFunctionId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" ADD CONSTRAINT "FK_c63b1110bbf09051be2f495d0be" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ALTER COLUMN "serverlessFunctionId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ALTER COLUMN "serverlessFunctionId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
