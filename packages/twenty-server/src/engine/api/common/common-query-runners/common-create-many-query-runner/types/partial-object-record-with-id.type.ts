import { type ObjectRecord } from 'twenty-shared/types';

export type PartialObjectRecordWithId = Partial<ObjectRecord> & { id: string };
