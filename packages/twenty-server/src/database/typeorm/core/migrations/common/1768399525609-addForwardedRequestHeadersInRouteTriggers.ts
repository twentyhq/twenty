import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddForwardedRequestHeadersInRouteTriggers1768399525609
  implements MigrationInterface
{
  name = 'AddForwardedRequestHeadersInRouteTriggers1768399525609';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD "forwardedRequestHeaders" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP COLUMN "forwardedRequestHeaders"`,
    );
  }
}
