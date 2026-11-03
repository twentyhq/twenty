import { matchPath } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type NavigationObjectMetadata = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'nameSingular' | 'namePlural'
>;

export const getNavigationMenuItemCurrentObjectMetadata = ({
  activeObjectMetadataItems,
  currentPath,
  currentObjectNamePlural,
  currentObjectNameSingular,
}: {
  activeObjectMetadataItems: NavigationObjectMetadata[];
  currentPath: string;
  currentObjectNamePlural?: string;
  currentObjectNameSingular?: string;
}): NavigationObjectMetadata | undefined => {
  const isCoreWorkflowPage =
    isDefined(matchPath(AppPath.WorkflowCoreIndexPage, currentPath)) ||
    isDefined(matchPath(AppPath.WorkflowCoreShowPage, currentPath));

  return activeObjectMetadataItems.find(
    (item) =>
      item.namePlural === currentObjectNamePlural ||
      item.nameSingular === currentObjectNameSingular ||
      (isCoreWorkflowPage &&
        item.nameSingular === CoreObjectNameSingular.Workflow),
  );
};
