import { FieldMetadataItem } from "@/object-metadata/types/FieldMetadataItem";
import { assertUnreachable } from "@/workflow/utils/assertUnreachable";
import { RelationDefinitionType } from "~/generated-metadata/graphql";

export const hasManyTargetRecords = (
  relationDefinition: NonNullable<FieldMetadataItem['relationDefinition']>,
) => {
  switch (relationDefinition.direction) {
    case RelationDefinitionType.MANY_TO_MANY:
    case RelationDefinitionType.ONE_TO_MANY: {
      return true;
    }
    case RelationDefinitionType.MANY_TO_ONE:
    case RelationDefinitionType.ONE_TO_ONE: {
      return false;
    }
    default: {
      return assertUnreachable(relationDefinition.direction);
    }
  }
};