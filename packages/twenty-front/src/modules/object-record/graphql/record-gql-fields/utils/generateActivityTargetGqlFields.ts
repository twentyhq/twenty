import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { isDefined } from 'twenty-shared/utils';

export type GenerateDepthRecordGqlFields = {
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'id' | 'nameSingular' | 'fields' | 'labelIdentifierFieldMetadataId'
  >[];
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  loadRelations?: 'activity' | 'relations' | 'both';
};

export const generateActivityTargetGqlFields = ({
  objectMetadataItems,
  activityObjectNameSingular,
  loadRelations = 'both',
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

  const activityLabelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(activityObjectMetadataItem);

  if (loadRelations === 'activity') {
    return {
      id: true,
      [activityObjectNameSingular]: {
        id: true,
        ...(isDefined(activityLabelIdentifierFieldMetadataItem)
          ? { [activityLabelIdentifierFieldMetadataItem.name]: true }
          : {}),
      },
    };
  }

  if (loadRelations === 'both') {
    return {
      id: true,
      [activityObjectNameSingular]: {
        id: true,
        ...(isDefined(activityLabelIdentifierFieldMetadataItem)
          ? { [activityLabelIdentifierFieldMetadataItem.name]: true }
          : {}),
      },
      ...generateDepthRecordGqlFieldsFromFields({
        depth: 1,
        fields: activityTargetObjectMetadataItem.fields,
        objectMetadataItems,
        shouldOnlyLoadRelationIdentifiers: true,
      }),
    };
  }

  if (loadRelations === 'relations') {
    return {
      ...generateDepthRecordGqlFieldsFromFields({
        depth: 1,
        fields: activityTargetObjectMetadataItem.fields.filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.name !== 'task' &&
            fieldMetadataItem.name !== 'note',
        ),
        objectMetadataItems,
        shouldOnlyLoadRelationIdentifiers: false,
      }),
    };
  }

  throw new Error(
    `Invalid loadRelations value: ${loadRelations}. Please use 'activity', 'relations', or 'both'.`,
  );
};
