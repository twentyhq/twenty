import { useLocation, useNavigate } from 'react-router-dom';

import { useCachedQueries } from '@/apollo/hooks/useCachedQueries';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const ObjectMetadataNavItems = () => {
  const { activeObjectMetadataItems, findObjectMetadataItemByNamePlural } =
    useObjectMetadataItemForSettings();
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;
  const { readQuery } = useCachedQueries();
  const generatedFindManyRecordsQuery = useGenerateFindManyRecordsQuery();

  const viewObjectMetadataItem = findObjectMetadataItemByNamePlural('views');

  console.log('viewObjectMetadataItem', viewObjectMetadataItem);
  if (viewObjectMetadataItem) {
    const cachedViews = readQuery({
      query: generatedFindManyRecordsQuery({
        objectMetadataItem: viewObjectMetadataItem,
      }),
    });

    console.log('cachedViews', cachedViews);
  }
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
      ].map((objectMetadataItem) => (
        <NavigationDrawerItem
          key={objectMetadataItem.id}
          label={objectMetadataItem.labelPlural}
          to={`/objects/${objectMetadataItem.namePlural}`}
          active={currentPath === `/objects/${objectMetadataItem.namePlural}`}
          Icon={getIcon(objectMetadataItem.icon)}
          onClick={() => {
            navigate(`/objects/${objectMetadataItem.namePlural}`);
          }}
        />
      ))}
    </>
  );
};
