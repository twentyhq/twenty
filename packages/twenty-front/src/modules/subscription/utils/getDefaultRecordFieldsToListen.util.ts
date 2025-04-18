import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getDefaultRecordFieldsToListen = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  switch (objectNameSingular) {
    case CoreObjectNameSingular.Workflow:
      return ['statuses'];
    default:
      return [];
  }
};
