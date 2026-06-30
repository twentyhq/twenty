import { types } from 'pg';

import { PG_DATE_TYPE_OID } from 'src/database/pg/constants/PG_DATE_TYPE_OID';

export const setPgDateTypeParser = () => {
  types.setTypeParser(PG_DATE_TYPE_OID, (val: string) => val);
};
