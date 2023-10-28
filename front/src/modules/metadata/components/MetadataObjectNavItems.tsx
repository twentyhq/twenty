import { useNavigate } from 'react-router-dom';

import { IconBuildingSkyscraper } from '@/ui/display/icon';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import { capitalize } from '~/utils/string/capitalize';

import { useDeleteOneMetadataObject } from '../hooks/useDeleteOneMetadataObject';
import { useFindManyMetadataObjects } from '../hooks/useFindManyMetadataObjects';

export const MetadataObjectNavItems = () => {
  const { metadataObjects } = useFindManyMetadataObjects();

  const { deleteOneMetadataObject } = useDeleteOneMetadataObject();

  const navigate = useNavigate();

  return (
    <>
      {metadataObjects
        .filter((metadataObject) => !!metadataObject.isActive)
        .map((metadataObject) => (
          <NavItem
            key={metadataObject.id}
            label={capitalize(metadataObject.namePlural)}
            to={`/objects/${metadataObject.namePlural}`}
            Icon={IconBuildingSkyscraper}
            onClick={() => {
              navigate(`/objects/${metadataObject.namePlural}`);
            }}
          />
        ))}
    </>
  );
};
