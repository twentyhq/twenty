import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type PartialObjectRecordWithId = Partial<ObjectRecord> & { id: string };
