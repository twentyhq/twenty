import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useApolloClient } from '@apollo/client';

import { useCachedQueries } from '@/apollo/hooks/useCachedQueries';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useGetRecordFromCache } from '@/object-record/hooks/useGetRecordFromCache';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const ObjectMetadataNavItems = () => {
  const { activeObjectMetadataItems } = useObjectMetadataItemForSettings();
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;
  const { readQuery } = useCachedQueries();

  const apolloClient = useApolloClient();

  const readFromCache = useGetRecordFromCache;
  const { findManyRecordsQuery } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const queries = apolloClient.readFragment({
    id: 'ROOT_QUERY',
    fragment: gql`
      fragment RootQuery on Query {
        views {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
  });

  const cachedViews = queries?.views;

  const { records } = useFindManyRecords({
    skip: cachedViews,
    objectNameSingular: CoreObjectNameSingular.View,
    useRecordsWithoutConnection: true,
  });

  console.log('navItemviews', cachedViews ?? records);

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
