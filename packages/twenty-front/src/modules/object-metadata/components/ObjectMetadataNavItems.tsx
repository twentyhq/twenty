import { useLocation, useNavigate } from 'react-router-dom';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { GraphQLView } from '@/views/types/GraphQLView';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';

export const ObjectMetadataNavItems = () => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  const { records: views } = usePrefetchedData<GraphQLView>(
    PrefetchKey.AllViews,
  );

  return (
    <>
      {[
        ...activeObjectMetadataItems
          .filter((item) =>
            ['person', 'company', 'opportunity'].includes(item.nameSingular),
          )
          .sort((objectMetadataItemA, objectMetadataItemB) => {
            const order = ['person', 'company', 'opportunity'];
            const indexA = order.indexOf(objectMetadataItemA.nameSingular);
            const indexB = order.indexOf(objectMetadataItemB.nameSingular);
            if (indexA === -1 || indexB === -1) {
              return objectMetadataItemA.nameSingular.localeCompare(
                objectMetadataItemB.nameSingular,
              );
            }
            return indexA - indexB;
          }),
        ...activeObjectMetadataItems
          .filter(
            (item) =>
              !['person', 'company', 'opportunity'].includes(item.nameSingular),
          )
          .sort((objectMetadataItemA, objectMetadataItemB) => {
            return new Date(objectMetadataItemA.createdAt) <
              new Date(objectMetadataItemB.createdAt)
              ? 1
              : -1;
          }),
      ].map((objectMetadataItem) => {
        const objectMetadataViews = getObjectMetadataItemViews(
          objectMetadataItem.id,
          views,
        );
        const viewId = objectMetadataViews[0]?.id;

        const navigationPath = `/objects/${objectMetadataItem.namePlural}${
          viewId ? `?view=${viewId}` : ''
        }`;

        return (
          <NavigationDrawerItem
            key={objectMetadataItem.id}
            label={objectMetadataItem.labelPlural}
            to={navigationPath}
            active={currentPath === `/objects/${objectMetadataItem.namePlural}`}
            Icon={getIcon(objectMetadataItem.icon)}
            onClick={() => {
              navigate(navigationPath);
            }}
          />
        );
      })}
    </>
  );
};
