import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTriggerToUpdateCanImpersonateOnFirstUser1734950137596
  implements MigrationInterface
{
  name = 'AddTriggerToUpdateCanImpersonateOnFirstUser1734950137596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
CREATE OR REPLACE FUNCTION set_can_impersonate_to_true_on_first_user()
    RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM core."user") THEN
        NEW."canImpersonate" := true;
        PERFORM delete_first_user_trigger();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`);
    queryRunner.query(`
CREATE TRIGGER insert_user_trigger
    BEFORE INSERT ON core."user"
    FOR EACH ROW
EXECUTE FUNCTION set_can_impersonate_to_true_on_first_user();
`);
    queryRunner.query(`
CREATE OR REPLACE FUNCTION delete_first_user_trigger()
    RETURNS void AS $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS insert_user_trigger ON core.user';
END;
$$ LANGUAGE plpgsql;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
DROP TRIGGER IF EXISTS insert_user_trigger ON core."user";
DROP FUNCTION IF EXISTS set_can_impersonate_to_true_on_first_user();
DROP FUNCTION IF EXISTS delete_first_user_trigger();
`);
  }
}
