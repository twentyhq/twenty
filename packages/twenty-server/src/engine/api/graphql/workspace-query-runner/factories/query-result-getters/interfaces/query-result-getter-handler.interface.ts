import { type ObjectRecord } from 'twenty-shared/types';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export interface QueryResultGetterHandlerInterface {
  handle(
    objectRecord: ObjectRecord,
    workspaceId: string,
    flatFieldMetadata: OrmFlatFieldMetadata[],
  ): Promise<ObjectRecord>;
}
