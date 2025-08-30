import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMissingFkOnViewTables1756209145695
  implements MigrationInterface
{
  name = 'AddMissingFkOnViewTables1756209145695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_193548db5abc45713087f7d1af6" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_b3aa7ec58cdd9e83729f2232591" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_818522b962a9b756accb5b3149d" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_3e5ea41c239ef1b75b0d42bef99" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_0a48a0b66daedac1314437be5eb" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_0a48a0b66daedac1314437be5eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_3e5ea41c239ef1b75b0d42bef99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_818522b962a9b756accb5b3149d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_b3aa7ec58cdd9e83729f2232591"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_193548db5abc45713087f7d1af6"`,
    );
  }
}
