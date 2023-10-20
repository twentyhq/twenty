import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import { useGetClientConfigQuery } from '~/generated/graphql';
import { capitalize } from '~/utils/string/capitalize';

import { useCreateNewTempsCustomObject } from '../hooks/useCreateNewTempCustomObject';
import { useFindManyMetadataObjects } from '../hooks/useFindManyMetadataObjects';

export const MetadataObjectNavItems = () => {
  const { data } = useGetClientConfigQuery();

  const { metadataObjects } = useFindManyMetadataObjects();

  // eslint-disable-next-line no-console
  console.log({
    metadataObjects,
  });

  const createNewTempCustomObject = useCreateNewTempsCustomObject();

  const isFlexibleBackendEnabled = data?.clientConfig?.flexibleBackendEnabled;

  if (!isFlexibleBackendEnabled) return <></>;

  return (
    <>
      <Button
        title="+ Create new object"
        variant="secondary"
        onClick={createNewTempCustomObject}
      />
      {metadataObjects
        .filter((metadataObject) => !!metadataObject.isActive)
        .map((metadataObject) => (
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
