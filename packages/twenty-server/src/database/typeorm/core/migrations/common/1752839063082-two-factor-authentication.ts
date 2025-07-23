import { MigrationInterface, QueryRunner } from 'typeorm';

export class TwoFactorAuthentication1752839063082
  implements MigrationInterface
{
  name = 'TwoFactorAuthentication1752839063082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."twoFactorAuthenticationMethod_strategy_enum" AS ENUM('TOTP')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."twoFactorAuthenticationMethod_status_enum" AS ENUM('PENDING', 'VERIFIED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."twoFactorAuthenticationMethod" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userWorkspaceId" uuid NOT NULL, "secret" text NOT NULL, "status" "core"."twoFactorAuthenticationMethod_status_enum" NOT NULL, "strategy" "core"."twoFactorAuthenticationMethod_strategy_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c455f6a499e7110fc95e4bea540" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2909f5139c479e4632df03fd5e" ON "core"."twoFactorAuthenticationMethod" ("userWorkspaceId", "strategy") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isTwoFactorAuthenticationEnforced" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorAuthenticationMethod" ADD CONSTRAINT "FK_b0f44ffd7c794beb48cb1e1b1a9" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorAuthenticationMethod" DROP CONSTRAINT "FK_b0f44ffd7c794beb48cb1e1b1a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isTwoFactorAuthenticationEnforced"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_2909f5139c479e4632df03fd5e"`,
    );
    await queryRunner.query(
      `DROP TABLE "core"."twoFactorAuthenticationMethod"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."twoFactorAuthenticationMethod_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."twoFactorAuthenticationMethod_strategy_enum"`,
    );
  }
}
