import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const useIsOpportunitiesCompanyFieldDisabled = () => {
  const { objectMetadataItem: opportunityMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular: CoreObjectNameSingular.Opportunity,
    },
  );
  const isOpportunitiesCompanyFieldDisabled =
    !opportunityMetadataItem.fields.find(
      (field) => field.name === CoreObjectNameSingular.Company,
    )?.isActive || false;
  return {
    isOpportunitiesCompanyFieldDisabled,
  };
};
