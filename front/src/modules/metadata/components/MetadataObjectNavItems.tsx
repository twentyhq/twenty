import { useNavigate } from 'react-router-dom';

import { Icon123 } from '@/ui/input/constants/icons';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import NavItem from '@/ui/navigation/navbar/components/NavItem';

import { useFindManyMetadataObjects } from '../hooks/useFindManyMetadataObjects';

export const MetadataObjectNavItems = () => {
  const { metadataObjects } = useFindManyMetadataObjects();

  const navigate = useNavigate();
  const { icons } = useLazyLoadIcons();

  return (
    <>
      {metadataObjects
        .filter(
          (metadataObject) =>
            metadataObject.isActive &&
            !metadataObject.namePlural.endsWith('V2'),
        )
        .map((metadataObject) => {
          return (
            <NavItem
              key={metadataObject.id}
              label={metadataObject.labelPlural}
              to={`/objects/${metadataObject.namePlural}`}
              Icon={metadataObject.icon ? icons[metadataObject.icon] : Icon123}
              onClick={() => {
                navigate(`/objects/${metadataObject.namePlural}`);
              }}
            />
          );
        })}
    </>
  );
};
