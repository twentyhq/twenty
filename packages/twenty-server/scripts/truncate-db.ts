import console from 'console';

import { connectionSource, performQuery } from './utils';

connectionSource
  .initialize()
  .then(async () => {
    await performQuery(
      `
        CREATE OR REPLACE FUNCTION drop_all() RETURNS VOID AS $$
          DECLARE schema_item RECORD; 
          BEGIN
            FOR schema_item IN
              SELECT subrequest."name" as schema_name
              FROM  (SELECT n.nspname AS "name"
              FROM pg_catalog.pg_namespace n
              WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema') as subrequest
            LOOP
              EXECUTE 'DROP SCHEMA ' || schema_item.schema_name || ' CASCADE'; 
            END LOOP; 
            RETURN; 
          END;
        $$ LANGUAGE plpgsql;
     
        SELECT drop_all ();
      `,
      'Dropping all schemas...',
    );
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
