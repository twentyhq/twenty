import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatThreadInboxStatusByThreadIdFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusByThreadIdFamilySelector';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { commandMenuTargetObjectPermissionsSelector } from '@/command-menu-item/states/commandMenuTargetObjectPermissionsSelector';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { useContextStoreInstanceId } from '@/context-store/hooks/useContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordPermissionsByRecordIdFamilySelector } from '@/object-record/record-sharing/states/recordPermissionsByRecordIdFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { getWorkspaceFeatureFlagsMap } from '@/workspace/utils/getWorkspaceFeatureFlagsMap';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { useAtomValue } from 'jotai';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { isDefined, resolveObjectMetadataLabel } from 'twenty-shared/utils';

export const useCurrentCommandMenuContextApi = (): CommandMenuContextApi => {
  const workspaceSurface = useWorkspaceSurface();
  const isInSidePanel = workspaceSurface.type === 'side-panel';
  const contextStoreInstanceId = useContextStoreInstanceId();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const { navigationMenuItems } = useNavigationMenuItemsData();

  const recordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : undefined;

  const favoriteRecordIds =
    !isNonEmptyArray(recordIds) || !isDefined(objectMetadataItem)
      ? []
      : recordIds.filter((recordId) =>
          navigationMenuItems?.some(
            (item) =>
              item.targetRecordId === recordId &&
              item.targetObjectMetadataId === objectMetadataItem.id,
          ),
        );

  const storedSelectedRecords = useAtomFamilySelectorValue(
    recordStoreRecordsSelector,
    { recordIds: recordIds ?? [] },
  );

  const recordPermissionsByRecordId = useAtomFamilySelectorValue(
    recordPermissionsByRecordIdFamilySelector,
    {
      objectMetadataId: objectMetadataItem?.id ?? '',
      recordIds: recordIds ?? [],
    },
  );

  // A chat's read and done state belongs to the member, not to the record,
  // so the inbox commands read it from here. They stay hidden until the
  // member state loads rather than offering the wrong half of a pair
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const inboxStatusThreadIds =
    objectMetadataItem?.nameSingular ===
      CoreObjectNameSingular.AgentChatThread &&
    isDefined(agentChatThreadParticipants)
      ? (recordIds ?? [])
      : [];
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatThreadInboxStatusByThreadId = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusByThreadIdFamilySelector,
    {
      threadIds: inboxStatusThreadIds,
      channelId:
        contextStoreInstanceId === AI_CHAT_INBOX_INSTANCE_ID
          ? (agentChatShownChannelView?.channelId ?? null)
          : null,
    },
  );

  // Records shared below the role's access level carry their own permissions, which availability expressions read per record
  const selectedRecords = storedSelectedRecords.map(
    (record): ObjectRecord => ({
      ...record,
      ...(isDefined(recordPermissionsByRecordId[record.id]) && {
        recordPermissions: recordPermissionsByRecordId[record.id],
      }),
      ...(isDefined(agentChatThreadInboxStatusByThreadId[record.id]) && {
        inboxStatus: agentChatThreadInboxStatusByThreadId[record.id],
      }),
    }),
  );

  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);

  const dashboardPageLayoutIdForCommandMenu =
    selectedRecords[0]?.pageLayoutId ?? currentPageLayoutId ?? '';

  const currentObjectPermissions = useObjectPermissionsForObject(
    objectMetadataItem?.id ?? '',
  );
  const objectPermissions = isDefined(objectMetadataItem)
    ? currentObjectPermissions
    : EMPTY_COMMAND_MENU_CONTEXT_API.objectPermissions;

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const baseRecordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem?.namePlural ?? '',
    contextStoreCurrentViewId ?? '',
  );
  const recordIndexId =
    isInSidePanel &&
    (workspaceSurface.ownsRouteLocation ||
      contextStoreInstanceId !== MAIN_CONTEXT_STORE_INSTANCE_ID)
      ? `${baseRecordIndexId}-${workspaceSurface.instanceId}`
      : baseRecordIndexId;

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const contextStoreCurrentPageType = useAtomComponentStateValue(
    contextStoreCurrentPageTypeComponentState,
  );

  const isDashboardInEditMode = useAtomValue(
    isDashboardInEditModeComponentState.atomFamily({
      instanceId: dashboardPageLayoutIdForCommandMenu,
    }),
  );

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const pageType = isDefined(contextStoreCurrentPageType)
    ? contextStoreCurrentPageType
    : ContextStorePageType.Index;

  const isSelectAll = contextStoreTargetedRecordsRule.mode === 'exclusion';

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const featureFlags = getWorkspaceFeatureFlagsMap(
    currentWorkspace?.featureFlags,
  );

  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  const currentUser = useAtomStateValue(currentUserState);
  const canImpersonate = currentUser?.canImpersonate === true;
  const canAccessFullAdminPanel = currentUser?.canAccessFullAdminPanel === true;

  const { targetObjectReadPermissions, targetObjectWritePermissions } =
    useAtomStateValue(commandMenuTargetObjectPermissionsSelector);

  const objectMetadataLabel = isDefined(objectMetadataItem)
    ? resolveObjectMetadataLabel({
        objectMetadataItem: objectMetadataItem,
        numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
      })
    : '';

  return {
    pageType,
    isInSidePanel,
    isDashboardPageLayoutInEditMode: isDashboardInEditMode,
    isLayoutCustomizationModeEnabled,
    favoriteRecordIds,
    isSelectAll,
    hasAnySoftDeleteFilterOnView,
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    objectPermissions,
    selectedRecords,
    featureFlags,
    permissionFlags: permissionFlagMap,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
    canImpersonate,
    canAccessFullAdminPanel,
    objectMetadataItem: objectMetadataItem ?? {},
    objectMetadataLabel,
  };
};
