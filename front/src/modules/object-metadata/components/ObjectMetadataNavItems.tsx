import { useLocation, useNavigate } from 'react-router-dom';

import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { Icon123 } from '@/ui/input/constants/icons';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import NavItem from '@/ui/navigation/navigation-drawer/components/NavItem';

export const ObjectMetadataNavItems = () => {
  const { activeObjectMetadataItems } = useObjectMetadataItemForSettings();
  const navigate = useNavigate();
  const { icons } = useLazyLoadIcons();
  const currentPath = useLocation().pathname;

  return (
    <>
      {activeObjectMetadataItems.map((objectMetadataItem) => {
        if (objectMetadataItem.nameSingular === 'opportunity') return null;
        return (
          <NavItem
            key={objectMetadataItem.id}
            label={objectMetadataItem.labelPlural}
            to={`/objects/${objectMetadataItem.namePlural}`}
            active={currentPath == `/objects/${objectMetadataItem.namePlural}`}
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
