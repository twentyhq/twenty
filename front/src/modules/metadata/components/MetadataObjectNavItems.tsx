import { IconBuildingSkyscraper } from '@/ui/display/icon';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import { useGetClientConfigQuery } from '~/generated/graphql';
import { capitalize } from '~/utils/string/capitalize';

import { useFindManyMetadataObjects } from '../hooks/useFindManyMetadataObjects';

export const MetadataObjectNavItems = () => {
  const { data } = useGetClientConfigQuery();

  const { metadataObjects } = useFindManyMetadataObjects();

  const isFlexibleBackendEnabled = data?.clientConfig?.flexibleBackendEnabled;

  if (!isFlexibleBackendEnabled) return <></>;

  return (
    <>
      {metadataObjects.map((metadataObject) => (
        <NavItem
          key={metadataObject.id}
          label={capitalize(metadataObject.namePlural)}
          to={`/objects/${metadataObject.namePlural}`}
          Icon={IconBuildingSkyscraper}
        />
      ))}
    </>
  );
};
