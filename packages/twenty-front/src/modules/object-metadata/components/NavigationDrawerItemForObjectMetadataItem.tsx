import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { View } from '@/views/types/View';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AnimatedExpandableContainer, useIcons } from 'twenty-ui';
import { getAppPath } from '~/utils/navigation/getAppPath';

export type NavigationDrawerItemForObjectMetadataItemProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const NavigationDrawerItemForObjectMetadataItem = ({
  objectMetadataItem,
}: NavigationDrawerItemForObjectMetadataItemProps) => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const objectMetadataViews = getObjectMetadataItemViews(
    objectMetadataItem.id,
    views,
  );

  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    mainContextStoreComponentInstanceId,
  );

  const lastVisitedViewPerObjectMetadataItem = useRecoilValue(
    lastVisitedViewPerObjectMetadataItemState,
  );

  const lastVisitedViewId =
    lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem.id];

  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  const navigationPath = getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: objectMetadataItem.namePlural },
    lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
  );

  const isActive =
    currentPath ===
      getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: objectMetadataItem.namePlural,
      }) ||
    currentPath.includes(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: '',
      }) + '/',
    );

  const shouldSubItemsBeDisplayed = isActive && objectMetadataViews.length > 1;

  const sortedObjectMetadataViews = [...objectMetadataViews].sort(
    (viewA, viewB) => viewA.position - viewB.position,
  );

  const selectedSubItemIndex = sortedObjectMetadataViews.findIndex(
    (view) => contextStoreCurrentViewId === view.id,
  );

  const subItemArrayLength = sortedObjectMetadataViews.length;

  return (
    <NavigationDrawerItemsCollapsableContainer
      isGroup={shouldSubItemsBeDisplayed}
    >
      <NavigationDrawerItem
        key={objectMetadataItem.id}
        label={objectMetadataItem.labelPlural}
        to={navigationPath}
        Icon={getIcon(objectMetadataItem.icon)}
        active={isActive}
      />

      <AnimatedExpandableContainer
        isExpanded={shouldSubItemsBeDisplayed}
        dimension="height"
        mode="fit-content"
        containAnimation
      >
        {sortedObjectMetadataViews.map((view, index) => (
          <NavigationDrawerSubItem
            label={view.name}
            to={getAppPath(
              AppPath.RecordIndexPage,
              { objectNamePlural: objectMetadataItem.namePlural },
              { viewId: view.id },
            )}
            active={contextStoreCurrentViewId === view.id}
            subItemState={getNavigationSubItemLeftAdornment({
              index,
              arrayLength: subItemArrayLength,
              selectedIndex: selectedSubItemIndex,
            })}
            Icon={getIcon(view.icon)}
            key={view.id}
          />
        ))}
      </AnimatedExpandableContainer>
    </NavigationDrawerItemsCollapsableContainer>
  );
};
