import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';

export type ScopedRelationAlias = RecordGqlRelationAlias & {
  ownerViewFieldId: string;
};
