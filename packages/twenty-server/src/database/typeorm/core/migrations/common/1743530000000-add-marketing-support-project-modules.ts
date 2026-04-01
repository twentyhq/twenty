import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarketingSupportProjectModules1743530000000 implements MigrationInterface {
  name = 'AddMarketingSupportProjectModules1743530000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "campaign_status" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
      CREATE TYPE "ticket_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED');
      CREATE TYPE "ticket_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      CREATE TYPE "project_status" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
      CREATE TYPE "sequence_status" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');
      CREATE TYPE "document_status" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EXPIRED');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE IF EXISTS "document_status";
      DROP TYPE IF EXISTS "sequence_status";
      DROP TYPE IF EXISTS "project_status";
      DROP TYPE IF EXISTS "ticket_priority";
      DROP TYPE IF EXISTS "ticket_status";
      DROP TYPE IF EXISTS "campaign_status";
    `);
  }
}
