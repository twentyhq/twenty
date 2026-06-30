import { type QueryRunner } from 'typeorm';

export interface FastInstanceCommand {
  up(queryRunner: QueryRunner): Promise<void>;
  down(queryRunner: QueryRunner): Promise<void>;
}
