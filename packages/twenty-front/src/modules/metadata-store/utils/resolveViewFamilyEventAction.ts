import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { type ViewFamilyEventAction } from '@/metadata-store/types/ViewFamilyEventAction';
import { isNonEmptyString } from '@sniptt/guards';

export const resolveViewFamilyEventAction = ({
  entityKey,
  operation,
  removedViewIds,
  knownViewIds,
}: {
  entityKey: MetadataEntityKey;
  operation: MetadataOperation<Record<string, unknown>>;
  removedViewIds: string[];
  knownViewIds: Set<string>;
}): ViewFamilyEventAction => {
  if (operation.type === 'delete') {
    return 'apply';
  }

  const record =
    operation.type === 'create'
      ? operation.createdRecord
      : operation.updatedRecord;
  const rootViewId = entityKey === 'views' ? record.id : record.viewId;

  if (!isNonEmptyString(rootViewId)) {
    return 'skip';
  }

  const isRemovedView = removedViewIds.includes(rootViewId);

  if (
    entityKey === 'views' &&
    operation.type === 'update' &&
    (isRemovedView || !knownViewIds.has(rootViewId))
  ) {
    return 'hydrate';
  }

  return isRemovedView ? 'skip' : 'apply';
};
