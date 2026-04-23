import { type BaseObjectRecord } from '@/object-record/types/BaseObjectRecord';

export const GRAPHQL_TYPENAME_KEY =
  '__typename' satisfies keyof BaseObjectRecord;
