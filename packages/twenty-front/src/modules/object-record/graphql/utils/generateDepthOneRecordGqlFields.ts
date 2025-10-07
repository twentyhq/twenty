import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export type GenerateDepthOneRecordGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
};

export const generateDepthOneRecordGqlFields = ({
  objectMetadataItem,
}: GenerateDepthOneRecordGqlFields) =>
  objectMetadataItem.readableFields.reduce<Record<string, true>>(
    (acc, field) => {
      return {
        ...acc,
        ...(isDefined(field.settings?.joinColumnName)
          ? {
              [field.settings.joinColumnName]: true,
            }
          : {}),
        [field.name]:
          // TODO: Remove once we have made the workflows lighter
          (objectMetadataItem.nameSingular ===
            CoreObjectNameSingular.Workflow ||
            objectMetadataItem.nameSingular ===
              CoreObjectNameSingular.WorkflowVersion ||
            objectMetadataItem.nameSingular ===
              CoreObjectNameSingular.WorkflowRun) &&
          (field.name === 'versions' || field.name === 'runs')
            ? { id: true, name: true }
            : true,
      };
    },
    {},
  );
