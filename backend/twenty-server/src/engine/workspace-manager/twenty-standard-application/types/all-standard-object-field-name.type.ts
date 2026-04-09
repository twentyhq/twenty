import { type STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

export type AllStandardObjectFieldName<T extends AllStandardObjectName> =
  keyof (typeof STANDARD_OBJECTS)[T]['fields'];
