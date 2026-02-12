import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveFieldMetadataIdInViewGroup1765808791153
  implements MigrationInterface
{
  name = 'RemoveFieldMetadataIdInViewGroup1765808791153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_b3aa7ec58cdd9e83729f2232591"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP COLUMN "fieldMetadataId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD "fieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_b3aa7ec58cdd9e83729f2232591" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
