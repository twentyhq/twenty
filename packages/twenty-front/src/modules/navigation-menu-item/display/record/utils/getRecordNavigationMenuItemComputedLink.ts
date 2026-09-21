import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getRecordNavigationMenuItemComputedLink = (
  item: Pick<
    NavigationMenuItem,
    'targetObjectMetadataId' | 'targetRecordIdentifier'
  >,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  if (
    !isDefined(objectMetadataItem) ||
    !isDefined(item.targetRecordIdentifier)
  ) {
    return '';
  }

  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow) {
    return getAppPath(AppPath.WorkflowCoreShowPage, {
      coreWorkflowId: item.targetRecordIdentifier.id,
    });
  }

  const objectRecordIdentifier = recordIdentifierToObjectRecordIdentifier({
    recordIdentifier: item.targetRecordIdentifier,
    objectMetadataItem,
  });
  return objectRecordIdentifier.linkToShowPage ?? '';
};
