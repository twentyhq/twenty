import { ObjectMetadataItem } from "@/object-metadata/types/ObjectMetadataItem";
import { hasObjectMetadataItemFieldCreatedBy } from "@/object-metadata/utils/hasObjectMetadataItemFieldCreatedBy";
import { hasObjectMetadataItemPositionField } from "@/object-metadata/utils/hasObjectMetadataItemPositionField";
import { FieldActorForInputValue } from "@/object-record/record-field/types/FieldMetadata";
import { ObjectRecord } from "@/object-record/types/ObjectRecord";

export const computeOptimisticCreateRecordBaseRecordInput = (objectMetadataItem: ObjectMetadataItem) => {
    let accumulator: Partial<ObjectRecord> = {};
  
    if (hasObjectMetadataItemFieldCreatedBy(objectMetadataItem)) {
      accumulator.createdBy = {
        source: 'MANUAL',
        context: {},
      } satisfies FieldActorForInputValue;
    }
  
    if (hasObjectMetadataItemPositionField(objectMetadataItem)) {
      accumulator.position = Number.NEGATIVE_INFINITY;
    }
  
    return accumulator;
  };