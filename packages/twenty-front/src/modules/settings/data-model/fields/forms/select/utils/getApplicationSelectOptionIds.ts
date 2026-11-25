import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// Options another application ships can only be deactivated, and keep their API value.
export const getApplicationSelectOptionIds = ({
  fieldMetadataItem,
  workspaceCustomApplicationId,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'applicationId' | 'options'>;
  workspaceCustomApplicationId?: string;
}): Set<string> => {
  if (!isDefined(workspaceCustomApplicationId)) {
    return new Set();
  }

  const applicationOptions = (fieldMetadataItem?.options ?? []).filter(
    (option) => {
      const optionApplicationId =
        option.applicationId ?? fieldMetadataItem?.applicationId;

      return (
        isDefined(optionApplicationId) &&
        optionApplicationId !== workspaceCustomApplicationId
      );
    },
  );

  return new Set(applicationOptions.map((option) => option.id));
};
