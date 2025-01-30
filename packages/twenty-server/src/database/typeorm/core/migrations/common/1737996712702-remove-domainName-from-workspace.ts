import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDomainNameFromWorkspace1737996712702
  implements MigrationInterface
{
  name = 'RemoveDomainNameFromWorkspace1737996712702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "domainName"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "domainName" character varying`,
    );
  }
}
