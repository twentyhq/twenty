import { useNavigate } from 'react-router-dom';

import { IconArchive } from '@/ui/display/icon';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { IconButton } from '@/ui/input/button/components/IconButton';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import { capitalize } from '~/utils/string/capitalize';

import { useCreateNewTempsCustomObject } from '../hooks/useCreateNewTempCustomObject';
import { useDeleteOneMetadataObject } from '../hooks/useDeleteOneMetadataObject';
import { useFindManyMetadataObjects } from '../hooks/useFindManyMetadataObjects';

export const MetadataObjectNavItems = () => {
  const { metadataObjects } = useFindManyMetadataObjects();

  // eslint-disable-next-line no-console
  console.log({
    metadataObjects,
  });

  const createNewTempCustomObject = useCreateNewTempsCustomObject();

  const { deleteOneMetadataObject } = useDeleteOneMetadataObject();

  const navigate = useNavigate();

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
          <div style={{ display: 'flex', flexDirection: 'row', width: '60%' }}>
            <IconButton
              Icon={IconArchive}
              onClick={() => {
                deleteOneMetadataObject(metadataObject.id);
              }}
            />
            <NavItem
              key={metadataObject.id}
              label={capitalize(metadataObject.namePlural)}
              to={`/objects/${metadataObject.namePlural}`}
              Icon={IconBuildingSkyscraper}
              onClick={() => {
                navigate(`/objects/${metadataObject.namePlural}`);
              }}
            />
          </div>
        ))}
    </>
  );
};
