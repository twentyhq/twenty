import { useConvertBackendItemToCommandMenuItemConfig } from '@/command-menu-item/server-items/hooks/useConvertBackendItemToCommandMenuItemConfig';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { useQuery } from '@apollo/client/react';
import {
  type CommandMenuContextApi,
  CoreObjectNameSingular,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemFieldsFragment,
  FindManyCommandMenuItemsDocument,
} from '~/generated-metadata/graphql';

export const useCommandMenuItemsFromBackend = (
  commandMenuContextApi: CommandMenuContextApi,
) => {
  const { convertBackendItemToCommandMenuItemConfig } =
    useConvertBackendItemToCommandMenuItemConfig();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const { data } = useQuery(FindManyCommandMenuItemsDocument);

  const allItems = data?.commandMenuItems ?? [];

  const workflowVersionIds = allItems
    .map((item) => item.workflowVersionId)
    .filter(isDefined);

  const { records: workflowVersions } = useFindManyRecords<
    Pick<WorkflowVersion, 'id' | 'workflowId' | 'trigger' | '__typename'>
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter:
      workflowVersionIds.length > 0
        ? { id: { in: workflowVersionIds } }
        : undefined,
    recordGqlFields: { id: true, workflowId: true, trigger: true },
    skip: workflowVersionIds.length === 0,
  });

  const workflowVersionById = new Map(
    workflowVersions.map((workflowVersion) => [
      workflowVersion.id,
      workflowVersion,
    ]),
  );

  const objectMatches = (item: CommandMenuItemFieldsFragment) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId ===
      contextStoreCurrentObjectMetadataItemId;

  return allItems
    .filter(objectMatches)
    .map((item) =>
      convertBackendItemToCommandMenuItemConfig(
        item,
        commandMenuContextApi,
        workflowVersionById,
      ),
    )
    .filter(isDefined)
    .filter((item) => item.shouldBeRegistered())
    .sort((a, b) => a.position - b.position);
};
