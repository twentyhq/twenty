import { type QueryRunner } from 'typeorm';

export const makeRemainingEntitiesUniversalIdentifierAndApplicationIdNotNullableQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_b1db027b64f44029389ace305ac"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_0082568653b80c15903c5a2ba9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_23b36d07d363f81200654fa1334"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e46f3e01227f1c8ee0c8041821"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_1e82563accb67114f65a3993b86"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_a14b5665091e86d461fb585924"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_bfc3498b964ef1bfc89b1f2bee3"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e6ed40a61e4584e98584019a47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_ff8cbebe1704954120df82bf393"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_38232fc0c6567ed029c2b1a12c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_817ea28e71e3b19acc258dd7dcd"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_8adc1fd6cb0dad2fbfd945954d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_9acc2804037a5c885633024368d"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_960465af116edf9ac501bfb3db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "FK_6edf47a8bfe17a5811998dc7162"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e9c53b9ac5035d3202a8737020"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_62cbd26626ff76df897181c7994"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_5b43e65e322d516c9307bed97a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" DROP CONSTRAINT "FK_46f69b93b58666bb388c5c7785a"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e6398c21e6bb31b525272fac84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_fb84d310b4cfe5916ced6fc3e2a"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_2a33a0e7e44c393ca7bb578dae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_5e7f19b88c0864db19e2bad0fc5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_256fabec226411154baba649df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_4493447c2e4029aa26cabf30460"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3763c4e8f942ff1e24040a13a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0082568653b80c15903c5a2ba9" ON "core"."roleTarget" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e46f3e01227f1c8ee0c8041821" ON "core"."rowLevelPermissionPredicate" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a14b5665091e86d461fb585924" ON "core"."rowLevelPermissionPredicateGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e6ed40a61e4584e98584019a47" ON "core"."viewFilterGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_38232fc0c6567ed029c2b1a12c" ON "core"."viewSort" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8adc1fd6cb0dad2fbfd945954d" ON "core"."cronTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_960465af116edf9ac501bfb3db" ON "core"."databaseEventTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e9c53b9ac5035d3202a8737020" ON "core"."routeTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5b43e65e322d516c9307bed97a" ON "core"."serverlessFunction" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e6398c21e6bb31b525272fac84" ON "core"."skill" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2a33a0e7e44c393ca7bb578dae" ON "core"."pageLayoutWidget" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_256fabec226411154baba649df" ON "core"."pageLayout" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3763c4e8f942ff1e24040a13a9" ON "core"."pageLayoutTab" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_b1db027b64f44029389ace305ac" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_23b36d07d363f81200654fa1334" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_1e82563accb67114f65a3993b86" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_bfc3498b964ef1bfc89b1f2bee3" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_ff8cbebe1704954120df82bf393" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_817ea28e71e3b19acc258dd7dcd" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_9acc2804037a5c885633024368d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD CONSTRAINT "FK_6edf47a8bfe17a5811998dc7162" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_62cbd26626ff76df897181c7994" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" ADD CONSTRAINT "FK_46f69b93b58666bb388c5c7785a" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_fb84d310b4cfe5916ced6fc3e2a" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_5e7f19b88c0864db19e2bad0fc5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_4493447c2e4029aa26cabf30460" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };
