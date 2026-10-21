import type { Store } from 'jotai/vanilla/store';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isDefined } from 'twenty-shared/utils';

export const computeContextStoreGraphqlFilterFromStore = ({
  store,
  contextStoreInstanceId,
}: {
  store: Store;
  contextStoreInstanceId: string;
}) => {
  const objectMetadataItemId = store.get(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: contextStoreInstanceId,
    }),
  );

  const objectMetadataItem = store
    .get(objectMetadataItemsSelector.atom)
    .find((item) => item.id === objectMetadataItemId);

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const currentWorkspaceMember = store.get(currentWorkspaceMemberState.atom);

  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const workspaceMemberTimeZone = currentWorkspaceMember?.timeZone;

  const userTimezone =
    isDefined(workspaceMemberTimeZone) && workspaceMemberTimeZone !== 'system'
      ? workspaceMemberTimeZone
      : systemTimeZone;

  return computeContextStoreFilters({
    contextStoreTargetedRecordsRule: store.get(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: contextStoreInstanceId,
      }),
    ),
    contextStoreFilters: store.get(
      contextStoreFiltersComponentState.atomFamily({
        instanceId: contextStoreInstanceId,
      }),
    ),
    contextStoreFilterGroups: store.get(
      contextStoreFilterGroupsComponentState.atomFamily({
        instanceId: contextStoreInstanceId,
      }),
    ),
    objectMetadataItem,
    fieldMetadataItems: store.get(flattenedFieldMetadataItemsSelector.atom),
    filterValueDependencies: {
      currentWorkspaceMemberId: currentWorkspaceMember?.id,
      timeZone: userTimezone,
    },
    contextStoreAnyFieldFilterValue: store.get(
      contextStoreAnyFieldFilterValueComponentState.atomFamily({
        instanceId: contextStoreInstanceId,
      }),
    ),
  });
};
