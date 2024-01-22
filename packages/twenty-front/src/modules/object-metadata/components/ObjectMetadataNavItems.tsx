import { useLocation, useNavigate } from 'react-router-dom';

import { useCachedRootQuery } from '@/apollo/hooks/useCachedRootQuery';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { QueryMethodName } from '@/object-metadata/types/QueryMethodName';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const ObjectMetadataNavItems = () => {
  const { activeObjectMetadataItems, findObjectMetadataItemByNamePlural } =
    useObjectMetadataItemForSettings();
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  const viewObjectMetadataItem = findObjectMetadataItemByNamePlural('views');

  const { cachedRootQuery } = useCachedRootQuery({
    objectMetadataItem: viewObjectMetadataItem,
    queryMethodName: QueryMethodName.FindMany,
  });

  const { records } = useFindManyRecords({
    skip: cachedRootQuery?.views,
    objectNameSingular: CoreObjectNameSingular.View,
    useRecordsWithoutConnection: true,
  });

  const views =
    records.length > 0
      ? records
      : cachedRootQuery?.views?.edges?.map((edge: any) => edge?.node);

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
        const viewId = views?.find(
          (view: any) => view?.objectMetadataId === objectMetadataItem.id,
        )?.id;

        const navigationPath = `/objects/${objectMetadataItem.namePlural}${
          viewId ? `?view=${viewId}` : ''
        }`;

        return (
          <NavigationDrawerItem
            key={objectMetadataItem.id}
            label={objectMetadataItem.labelPlural}
            to={navigationPath}
            active={currentPath === navigationPath}
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
