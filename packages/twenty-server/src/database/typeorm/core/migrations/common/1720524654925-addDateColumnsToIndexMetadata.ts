import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateColumnsToIndexMetadata1720524654925
  implements MigrationInterface
{
  name = 'AddDateColumnsToIndexMetadata1720524654925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "createdAt"`,
    );
  }
}
