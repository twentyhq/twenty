import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';
import {
  type FieldWidgetJunctionConfig,
  resolveFieldWidgetJunctionConfig,
} from '@/page-layout/widgets/field/utils/resolveFieldWidgetJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

type GetFieldWidgetRelationTraversalArgs = {
  sourceFieldMetadataItem: FieldMetadataItem | undefined;
  nestedRelationFieldMetadataItem?: FieldMetadataItem;
  objectMetadataItems: JunctionObjectMetadataItem[];
};

type FieldWidgetRelationTraversal = {
  targetObjectMetadataId: string | undefined;
  inverseFieldMetadataId: string | undefined;
  relationTargetFieldMetadataId: string | null;
};

const EMPTY_TRAVERSAL: FieldWidgetRelationTraversal = {
  targetObjectMetadataId: undefined,
  inverseFieldMetadataId: undefined,
  relationTargetFieldMetadataId: null,
};

// A junction relation lists the records behind the junction, like the card
// and field display modes do, so the embedded view targets the junction
// target object and scopes it back through the junction: the target's inverse
// field, traversed to the junction field pointing at the current record. A
// morph junction has no single object to list, so it gets no embedded view.
const getFieldWidgetJunctionTraversal = (
  junctionConfig: FieldWidgetJunctionConfig,
): FieldWidgetRelationTraversal => {
  if (
    !isUsableJunctionConfig(junctionConfig) ||
    junctionConfig.isMorphRelation ||
    !isDefined(junctionConfig.sourceField)
  ) {
    return EMPTY_TRAVERSAL;
  }

  const [junctionTargetField] = junctionConfig.targetFields;

  if (!isDefined(junctionTargetField?.relation)) {
    return EMPTY_TRAVERSAL;
  }

  return {
    targetObjectMetadataId:
      junctionTargetField.relation.targetObjectMetadata.id,
    inverseFieldMetadataId: junctionTargetField.relation.targetFieldMetadata.id,
    relationTargetFieldMetadataId: junctionConfig.sourceField.id,
  };
};

// The widget's embedded view lists records of the last hop's target object,
// scoped back to the current record through that hop's inverse relation. A
// nested widget scopes one relation further out, which the seeded view filter
// expresses as relationTargetFieldMetadataId: the first hop's inverse.
export const getFieldWidgetRelationTraversal = ({
  sourceFieldMetadataItem,
  nestedRelationFieldMetadataItem,
  objectMetadataItems,
}: GetFieldWidgetRelationTraversalArgs): FieldWidgetRelationTraversal => {
  const junctionConfig =
    isDefined(sourceFieldMetadataItem) &&
    !isDefined(nestedRelationFieldMetadataItem)
      ? resolveFieldWidgetJunctionConfig({
          fieldMetadataItem: sourceFieldMetadataItem,
          objectMetadataItems,
        })
      : null;

  if (isDefined(junctionConfig)) {
    return getFieldWidgetJunctionTraversal(junctionConfig);
  }

  const lastHopFieldMetadataItem =
    nestedRelationFieldMetadataItem ?? sourceFieldMetadataItem;

  // Only a one-to-many first hop needs the traversal: its intermediate
  // records carry the join column pointing back at the current record. A
  // many-to-one first hop points at a single intermediate record, which the
  // widget supplies as the filter's current record, so the seeded filter
  // stays a direct one.
  const shouldTraverseFirstHop =
    isDefined(nestedRelationFieldMetadataItem) &&
    isDefined(sourceFieldMetadataItem) &&
    isOneToManyRelationField(sourceFieldMetadataItem);

  return {
    targetObjectMetadataId:
      lastHopFieldMetadataItem?.relation?.targetObjectMetadata.id,
    inverseFieldMetadataId:
      lastHopFieldMetadataItem?.relation?.targetFieldMetadata.id,
    relationTargetFieldMetadataId: shouldTraverseFirstHop
      ? (sourceFieldMetadataItem.relation?.targetFieldMetadata.id ?? null)
      : null,
  };
};
