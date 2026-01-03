import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { type RelationType } from '~/generated-metadata/graphql';

type FieldMetadataItemInputWithRelationFormValues = Partial<
  Pick<
    FieldMetadataItem,
    | 'name'
    | 'label'
    | 'icon'
    | 'description'
    | 'defaultValue'
    | 'type'
    | 'options'
    | 'settings'
    | 'isLabelSyncedWithName'
    | 'isUnique'
  >
> & {
  // Relation form stores these at root level, not inside settings
  relationType?: RelationType;
  // Junction configuration (mutually exclusive)
  junctionTargetRelationFieldIds?: string[];
  junctionMorphId?: string;
};

export const formatFieldMetadataItemInput = (
  input: FieldMetadataItemInputWithRelationFormValues,
) => {
  // For relation fields, the form stores relationType and junction config
  // at root level, but they need to be in settings for the API
  let settings = input.settings;

  if (
    isDefined(input.relationType) ||
    isDefined(input.junctionTargetRelationFieldIds) ||
    isDefined(input.junctionMorphId)
  ) {
    // Handle junction config with mutual exclusivity
    // When junctionMorphId is set, clear junctionTargetRelationFieldIds and vice versa
    const junctionConfig = isDefined(input.junctionMorphId)
      ? {
          junctionMorphId: input.junctionMorphId,
          junctionTargetRelationFieldIds: undefined,
        }
      : isDefined(input.junctionTargetRelationFieldIds)
        ? {
            junctionTargetRelationFieldIds:
              input.junctionTargetRelationFieldIds,
            junctionMorphId: undefined,
          }
        : {};

    settings = {
      ...input.settings,
      ...(isDefined(input.relationType) && {
        relationType: input.relationType,
      }),
      ...junctionConfig,
    };
  }

  return {
    defaultValue: input.defaultValue,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label: input.label?.trim(),
    name: input.name?.trim(),
    options: input.options,
    settings,
    isLabelSyncedWithName: input.isLabelSyncedWithName,
    isUnique: input.isUnique,
  };
};
