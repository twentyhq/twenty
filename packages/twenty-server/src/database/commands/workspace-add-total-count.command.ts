import { Command, CommandRunner } from 'nest-commander';
import chalk from 'chalk';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';

@Command({
  name: 'workspace:add-total-count',
  description: 'Add pg_graphql total count directive to all workspace tables',
})
export class WorkspaceAddTotalCountCommand extends CommandRunner {
  constructor(private readonly typeORMService: TypeORMService) {
    super();
  }

  async run(): Promise<void> {
    const mainDataSource = this.typeORMService.getMainDataSource();

    try {
      await mainDataSource.query(`
        DO $$
        DECLARE
            schema_cursor CURSOR FOR SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace_%';
            schema_name text;
            table_rec record;
        BEGIN
            OPEN schema_cursor;
            LOOP
                FETCH schema_cursor INTO schema_name;
                EXIT WHEN NOT FOUND;
                
                FOR table_rec IN SELECT t.table_name FROM information_schema.tables t WHERE t.table_schema = schema_name
                LOOP
                    EXECUTE 'COMMENT ON TABLE ' || quote_ident(schema_name) || '.' || quote_ident(table_rec.table_name) || ' IS e''@graphql({"totalCount": {"enabled": true}})'';';
                END LOOP;
            END LOOP;
            CLOSE schema_cursor;
        END $$;    
      `);

      console.log(
        chalk.green('Total count directive added to all workspace tables'),
      );
    } catch (error) {
      console.log(
        chalk.red('Error adding total count directive to all workspace tables'),
      );
    }
  }
}
