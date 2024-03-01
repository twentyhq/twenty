import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { isNonNullable } from '~/utils/isNonNullable';

export const getChildRelationArray = ({
  childRelation,
}: {
  childRelation: any;
}) => {
  if (
    isNonNullable(childRelation.edges) &&
    Array.isArray(childRelation.edges)
  ) {
    return childRelation.edges.map((edge: ObjectRecordEdge) => edge.node);
  } else {
    return childRelation;
  }
};
