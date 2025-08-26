import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMetadataToBillingPrice1756130378555
  implements MigrationInterface
{
  name = 'AddMetadataToBillingPrice1756130378555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice"
        ADD metadata JSONB DEFAULT '{}'::jsonb NOT NULL;
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP COLUMN "metadata"`,
    );
  }
}
