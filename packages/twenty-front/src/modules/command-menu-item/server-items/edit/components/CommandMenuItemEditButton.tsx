import { AnimatedIconCrossfade } from 'twenty-ui/utilities';
import { commandMenuItemEditNumberOfSelectedRecordsState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditNumberOfSelectedRecordsState';
import { commandMenuItemEditObjectMetadataItemIdState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditObjectMetadataItemIdState';
import { commandMenuItemEditRecordSelectionPreviewModeState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditRecordSelectionPreviewModeState';
import { commandMenuItemEditTargetedRecordsRuleState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditTargetedRecordsRuleState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPencil, IconX } from 'twenty-ui/display';
import { AnimatedButton } from 'twenty-ui/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const CommandMenuItemEditButton = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

  const isCommandMenuEditPageActive =
    isSidePanelOpened && sidePanelPage === SidePanelPages.CommandMenuEdit;

  if (!isLayoutCustomizationModeEnabled || !isCommandMenuItemEnabled) {
    return null;
  }

  const handleClick = () => {
    if (isCommandMenuEditPageActive) {
      closeSidePanelMenu();

      return;
    }

    store.set(
      commandMenuItemEditObjectMetadataItemIdState.atomFamily({
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      }),
      store.get(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ) ?? null,
    );

    store.set(
      commandMenuItemEditTargetedRecordsRuleState.atomFamily({
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      }),
      store.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    );

    store.set(
      commandMenuItemEditNumberOfSelectedRecordsState.atomFamily({
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      }),
      store.get(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    );

    store.set(
      commandMenuItemEditRecordSelectionPreviewModeState.atomFamily({
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      }),
      'selection',
    );

    navigateSidePanel({
      page: SidePanelPages.CommandMenuEdit,
      pageTitle: t`Edit actions`,
      pageIcon: IconPencil,
      resetNavigationStack: true,
    });
  };

  return (
    <AnimatedButton
      animatedSvg={
        <AnimatedIconCrossfade
          isActive={isCommandMenuEditPageActive}
          ActiveIcon={IconX}
          InactiveIcon={IconPencil}
        />
      }
      title={t`Edit actions`}
      variant="secondary"
      size="small"
      onClick={handleClick}
    />
  );
};
