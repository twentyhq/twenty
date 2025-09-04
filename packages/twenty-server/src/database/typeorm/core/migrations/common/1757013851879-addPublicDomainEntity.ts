import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddPublicDomainEntity1757013851879 implements MigrationInterface {
  name = 'AddPublicDomainEntity1757013851879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."publicDomain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" character varying NOT NULL, "isValidated" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, CONSTRAINT "UQ_1311e24fbd049c561c53a274f2a" UNIQUE ("domain"), CONSTRAINT "PK_ff55a0f1bc3b6e2c32feff734b1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."publicDomain" ADD CONSTRAINT "FK_7e9ca5fd7aa30b8396ea3d1d6be" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."publicDomain" DROP CONSTRAINT "FK_7e9ca5fd7aa30b8396ea3d1d6be"`,
    );
    await queryRunner.query(`DROP TABLE "core"."publicDomain"`);
  }
}
