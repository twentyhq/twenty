import { useNavigate } from 'react-router-dom';

import { Icon123 } from '@/ui/input/constants/icons';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import { capitalize } from '~/utils/string/capitalize';

import { useFindManyObjectMetadataItems } from '../hooks/useFindManyObjectMetadataItems';

export const ObjectMetadataNavItems = () => {
  const { ObjectMetadataItems } = useFindManyObjectMetadataItems();

  const navigate = useNavigate();
  const { icons } = useLazyLoadIcons();

  return (
    <>
      {ObjectMetadataItems.filter(
        (ObjectMetadataItem) => !!ObjectMetadataItem.isActive,
      )
        .filter(
          (ObjectMetadataItems) =>
            !ObjectMetadataItems.namePlural.endsWith('V2'),
        )
        .map((ObjectMetadataItem) => {
          return (
            <NavItem
              key={ObjectMetadataItem.id}
              label={capitalize(ObjectMetadataItem.namePlural)}
              to={`/objects/${ObjectMetadataItem.namePlural}`}
              Icon={
                ObjectMetadataItem.icon
                  ? icons[ObjectMetadataItem.icon]
                  : Icon123
              }
              onClick={() => {
                navigate(`/objects/${ObjectMetadataItem.namePlural}`);
              }}
            />
          );
        })}
    </>
  );
};
