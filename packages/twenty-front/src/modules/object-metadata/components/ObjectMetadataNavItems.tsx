import React from 'react';

import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined, useIcons } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { ObjectMetadataNavItemsSkeletonLoader } from '@/object-metadata/components/ObjectMetadataNavItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { View } from '@/views/types/View';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';

export const ObjectMetadataNavItems = ({ isRemote }: { isRemote: boolean }) => {
  const currentUser = useRecoilValue(currentUserState);

  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Objects' + (isRemote ? 'Remote' : 'Workspace'));
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveObjectMetadataItems = activeObjectMetadataItems.filter(
    (item) => (isRemote ? item.isRemote : !item.isRemote),
  );
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;
  const currentPathWithSearch = currentPath + useLocation().search;

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const loading = useIsPrefetchLoading();

  if (loading && isDefined(currentUser)) {
    return <ObjectMetadataNavItemsSkeletonLoader />;
  }

  return (
    filteredActiveObjectMetadataItems.length > 0 && (
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle
          label={isRemote ? 'Remote' : 'Workspace'}
          onClick={() => toggleNavigationSection()}
        />

        {isNavigationSectionOpen &&
          [
            ...filteredActiveObjectMetadataItems
              .filter((item) =>
                ['person', 'company', 'opportunity'].includes(
                  item.nameSingular,
                ),
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
            ...filteredActiveObjectMetadataItems
              .filter(
                (item) =>
                  !['person', 'company', 'opportunity'].includes(
                    item.nameSingular,
                  ),
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

            const shouldSubItemsBeDisplayed =
              currentPath === `/objects/${objectMetadataItem.namePlural}` &&
              objectMetadataViews.length > 1;

            return (
              <React.Fragment key={objectMetadataItem.id}>
                <NavigationDrawerItem
                  key={objectMetadataItem.id}
                  label={objectMetadataItem.labelPlural}
                  to={navigationPath}
                  Icon={getIcon(objectMetadataItem.icon)}
                  active={
                    currentPath === `/objects/${objectMetadataItem.namePlural}`
                  }
                />
                {shouldSubItemsBeDisplayed &&
                  objectMetadataViews
                    .sort((viewA, viewB) =>
                      viewA.key === 'INDEX'
                        ? -1
                        : viewA.position - viewB.position,
                    )
                    .map((view) => (
                      <NavigationDrawerSubItem
                        key={view.id}
                        label={view.name}
                        to={`/objects/${objectMetadataItem.namePlural}?view=${view.id}`}
                        active={
                          currentPathWithSearch ===
                          `/objects/${objectMetadataItem.namePlural}?view=${view.id}`
                        }
                        Icon={getIcon(view.icon)}
                      />
                    ))}
              </React.Fragment>
            );
          })}
      </NavigationDrawerSection>
    )
  );
};
