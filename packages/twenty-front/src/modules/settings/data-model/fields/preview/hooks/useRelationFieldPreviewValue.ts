import { usePreviewRecord } from '@/settings/data-model/fields/preview/hooks/usePreviewRecord';

type UseRelationFieldPreviewParams = {
  relationObjectNameSingular: string;
  skip?: boolean;
};

export const useRelationFieldPreviewValue = ({
  relationObjectNameSingular,
  skip,
}: UseRelationFieldPreviewParams) =>
  usePreviewRecord({
    objectNameSingular: relationObjectNameSingular,
    skip,
  });
