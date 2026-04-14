import { useLocation, useParams } from 'react-router-dom';

import { useWorkspaceNavigationObjectMetadataIds } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationObjectMetadataIds';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

export const NavigationDrawerOpenedSection = () => {
  const { t } = useLingui();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const {
    objectMetadataIdsWithAnyNavigationItem,
    objectMetadataIdsWithObjectNavigationItem,
  } = useWorkspaceNavigationObjectMetadataIds();

  const {
    objectNamePlural: currentObjectNamePlural,
    objectNameSingular: currentObjectNameSingular,
  } = useParams();

  const location = useLocation();

  const objectMetadataItem = activeObjectMetadataItems.find(
    (item) =>
      item.namePlural === currentObjectNamePlural ||
      item.nameSingular === currentObjectNameSingular,
  );

  const isOnRecordShowPage =
    isDefined(objectMetadataItem) &&
    location.pathname.includes(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: '',
      }) + '/',
    );

  const relevantMetadataIds = isOnRecordShowPage
    ? objectMetadataIdsWithObjectNavigationItem
    : objectMetadataIdsWithAnyNavigationItem;

  const shouldShowOpenedSection = isDefined(objectMetadataItem)
    ? !relevantMetadataIds.has(objectMetadataItem.id)
    : false;

  return (
    <AnimatedExpandableContainer isExpanded={shouldShowOpenedSection}>
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={t`Opened`}
        objectMetadataItems={
          isDefined(objectMetadataItem) ? [objectMetadataItem] : []
        }
      />
    </AnimatedExpandableContainer>
  );
};
