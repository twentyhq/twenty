import { useLocation, useNavigate } from 'react-router-dom';

import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const ObjectMetadataNavItems = () => {
  const { activeObjectMetadataItems } = useObjectMetadataItemForSettings();
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  return (
    <>
      {activeObjectMetadataItems.map((objectMetadataItem) =>
        objectMetadataItem.nameSingular === 'opportunity' ? null : (
          <NavigationDrawerItem
            key={objectMetadataItem.id}
            label={objectMetadataItem.labelPlural}
            to={`/objects/${objectMetadataItem.namePlural}`}
            active={currentPath == `/objects/${objectMetadataItem.namePlural}`}
            Icon={getIcon(objectMetadataItem.icon)}
            onClick={() => {
              navigate(`/objects/${objectMetadataItem.namePlural}`);
            }}
          />
        ),
      )}
    </>
  );
};
