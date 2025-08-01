import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeFieldMetadataRelationConstraintDeferrable1752993324991
  implements MigrationInterface
{
  name = 'MakeFieldMetadataRelationConstraintDeferrable1752993324991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing constraint
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_47a6c57e1652b6475f8248cff78"`,
    );

    // Recreate it as deferrable and initially deferred
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_47a6c57e1652b6475f8248cff78" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") DEFERRABLE INITIALLY DEFERRED`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the deferrable constraint
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_47a6c57e1652b6475f8248cff78"`,
    );

    // Recreate it as non-deferrable
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_47a6c57e1652b6475f8248cff78" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id")`,
    );
  }
}
