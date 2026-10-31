import { type ObjectRecordsPermissionGrants } from 'twenty-shared/application';

// the only objects a run is handed tools for, so it is not handed one per object its roles can reach
export type ExplicitObjectGrants = ObjectRecordsPermissionGrants;
