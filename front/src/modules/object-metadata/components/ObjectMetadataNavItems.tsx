import { useNavigate } from 'react-router-dom';

import { Icon123 } from '@/ui/input/constants/icons';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import NavItem from '@/ui/navigation/navbar/components/NavItem';

import { useFindManyObjectMetadataItems } from '../hooks/useFindManyObjectMetadataItems';

export const ObjectMetadataNavItems = () => {
  const { objectMetadataItems } = useFindManyObjectMetadataItems({
    objectFilter: {
      isSystem: { is: false },
    },
    fieldFilter: {
      isSystem: { is: false },
    },
  });

  const navigate = useNavigate();
  const { icons } = useLazyLoadIcons();

  return (
    <>
      {objectMetadataItems.map((objectMetadataItem) => {
        return (
          <NavItem
            key={objectMetadataItem.id}
            label={objectMetadataItem.labelPlural}
            to={`/objects/${objectMetadataItem.namePlural}`}
            Icon={
              objectMetadataItem.icon ? icons[objectMetadataItem.icon] : Icon123
            }
            onClick={() => {
              navigate(`/objects/${objectMetadataItem.namePlural}`);
            }}
          />
        );
      })}
    </>
  );
};
