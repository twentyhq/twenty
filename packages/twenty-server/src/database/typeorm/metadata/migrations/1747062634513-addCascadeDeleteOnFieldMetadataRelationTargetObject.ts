import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteOnFieldMetadataRelationTargetObject1747062634513
  implements MigrationInterface
{
  name = 'AddCascadeDeleteOnFieldMetadataRelationTargetObject1747062634513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT IF EXISTS "FK_6f6c87ec32cca956d8be321071c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_6f6c87ec32cca956d8be321071c" FOREIGN KEY ("relationTargetObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_6f6c87ec32cca956d8be321071c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_6f6c87ec32cca956d8be321071c" FOREIGN KEY ("relationTargetObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
