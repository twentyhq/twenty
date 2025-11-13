import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { isDefined } from 'twenty-shared/utils';

export type GenerateDepthRecordGqlFields = {
  objectMetadataItems: ObjectMetadataItem[];
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  depth: 0 | 1;
  shouldOnlyLoadActivityIdentifiers?: boolean;
};

export const generateActivityTargetGqlFields = ({
  objectMetadataItems,
  activityObjectNameSingular,
  depth,
  shouldOnlyLoadActivityIdentifiers = true,
}: GenerateDepthRecordGqlFields) => {
  const isNote = activityObjectNameSingular === CoreObjectNameSingular.Note;
  const activityTargetNameSingular = isNote
    ? CoreObjectNameSingular.NoteTarget
    : CoreObjectNameSingular.TaskTarget;

  const activityTargetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === activityTargetNameSingular,
  );

  const activityObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === activityObjectNameSingular,
  );

  if (
    !isDefined(activityTargetObjectMetadataItem) ||
    !isDefined(activityObjectMetadataItem)
  ) {
    return {};
  }

  if (shouldOnlyLoadActivityIdentifiers) {
    const activityLabelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(activityObjectMetadataItem);

    return {
      id: true,
      [activityObjectNameSingular]: {
        id: true,
        ...(isDefined(activityLabelIdentifierFieldMetadataItem)
          ? { [activityLabelIdentifierFieldMetadataItem.name]: true }
          : {}),
      },
    };
  } else {
    return {
      ...generateDepthRecordGqlFieldsFromFields({
        depth,
        fields: activityTargetObjectMetadataItem.fields,
        objectMetadataItems,
        shouldOnlyLoadRelationIdentifiers: false,
      }),
      [activityObjectNameSingular]: true,
    };
  }
};
