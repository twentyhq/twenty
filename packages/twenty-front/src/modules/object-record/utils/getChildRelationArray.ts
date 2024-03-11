import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { isDefined } from '~/utils/isDefined';

export const getChildRelationArray = ({
  childRelation,
}: {
  childRelation: any;
}) => {
  if (isDefined(childRelation.edges) && Array.isArray(childRelation.edges)) {
    return childRelation.edges.map((edge: ObjectRecordEdge) => edge.node);
  } else {
    return childRelation;
  }
};
