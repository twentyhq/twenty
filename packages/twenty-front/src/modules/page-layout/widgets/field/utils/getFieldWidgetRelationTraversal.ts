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

// Lists the junction's target records, scoped back through the junction; morph junctions get no view.
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

// A nested widget scopes one relation further out via relationTargetFieldMetadataId (the first hop's inverse).
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

  // Only a one-to-many first hop needs traversal; a many-to-one first hop is supplied as the filter's current record, so the filter stays direct.
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
