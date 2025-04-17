import { ActionMenuContextType } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuContextProviderWorkflowObjects } from '@/action-menu/contexts/ActionMenuContextProviderWorkflowObjects';
import { ActionMenuContextProviderWorkflowsEnabled } from '@/action-menu/contexts/ActionMenuContextProviderWorkflowsEnabled';
import { ActionMenuContextProviderWorkflowsNotEnabled } from '@/action-menu/contexts/ActionMenuContextProviderWorkflowsNotEnabled';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const ActionMenuContextProvider = ({
  children,
  isInRightDrawer,
  displayType,
  actionMenuType,
}: Omit<ActionMenuContextType, 'actions'> & {
  children: React.ReactNode;
}) => {
  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const localContextStoreCurrentObjectMetadataItemId =
    useRecoilComponentValueV2(
      contextStoreCurrentObjectMetadataItemIdComponentState,
    );

  const mainContextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const localContextStoreObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === localContextStoreCurrentObjectMetadataItemId,
  );

  const mainContextStoreObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === mainContextStoreCurrentObjectMetadataItemId,
  );

  const objectMetadataItem =
    localContextStoreObjectMetadataItem ?? mainContextStoreObjectMetadataItem;

  const isWorkflowObject =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Workflow ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.WorkflowRun ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.WorkflowVersion;

  if (isWorkflowEnabled && isDefined(objectMetadataItem) && isWorkflowObject) {
    return (
      <ActionMenuContextProviderWorkflowObjects
        isInRightDrawer={isInRightDrawer}
        displayType={displayType}
        actionMenuType={actionMenuType}
        objectMetadataItem={objectMetadataItem}
      >
        {children}
      </ActionMenuContextProviderWorkflowObjects>
    );
  }

  if (
    isWorkflowEnabled &&
    isDefined(objectMetadataItem) &&
    (actionMenuType === 'command-menu' ||
      actionMenuType === 'command-menu-show-page-action-menu-dropdown')
  ) {
    return (
      <ActionMenuContextProviderWorkflowsEnabled
        isInRightDrawer={isInRightDrawer}
        displayType={displayType}
        actionMenuType={actionMenuType}
        objectMetadataItem={objectMetadataItem}
      >
        {children}
      </ActionMenuContextProviderWorkflowsEnabled>
    );
  }

  return (
    <ActionMenuContextProviderWorkflowsNotEnabled
      isInRightDrawer={isInRightDrawer}
      displayType={displayType}
      actionMenuType={actionMenuType}
      objectMetadataItem={objectMetadataItem}
    >
      {children}
    </ActionMenuContextProviderWorkflowsNotEnabled>
  );
};
