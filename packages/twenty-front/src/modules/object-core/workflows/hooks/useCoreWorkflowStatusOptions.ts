import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type SelectOption } from 'twenty-ui/input';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

export const useCoreWorkflowStatusOptions = (): SelectOption[] => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const statusesField = objectMetadataItem.fields.find(
    (field) => field.name === 'statuses',
  );

  return statusesField?.options ?? [];
};
