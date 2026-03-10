import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useSaveNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useSaveNavigationMenuItemsDraft';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconCheck, useIcons } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.color.blue};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledTitle = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const NavigationMenuEditModeBar = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [isSaving, setIsSaving] = useState(false);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeState,
  );
  const setIsNavigationMenuInEditMode = useSetAtomState(
    isNavigationMenuInEditModeState,
  );
  const { saveDraft } = useSaveNavigationMenuItemsDraft();
  const { isDirty } = useNavigationMenuItemsDraftState();

  const cancelEditMode = () => {
    setNavigationMenuItemsDraft(null);
    setSelectedNavigationMenuItemInEditMode(null);
    setIsNavigationMenuInEditMode(false);
    const isNavItemPageOpen =
      sidePanelPage === SidePanelPages.NavigationMenuAddItem ||
      sidePanelPage === SidePanelPages.NavigationMenuItemEdit;
    if (isNavItemPageOpen) {
      closeSidePanelMenu();
    }
  };

  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const showNavigationMenuEditModeBar =
    isNavigationMenuItemEditingEnabled && isNavigationMenuInEditMode;

  const handleSave = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      await saveDraft();
      cancelEditMode();
      closeSidePanelMenu();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to save navigation layout`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const IconPaint = getIcon('IconPaint');

  return (
    <AnimatePresence>
      {showNavigationMenuEditModeBar && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: theme.animation.duration.normal,
            ease: 'easeInOut',
          }}
        >
          <StyledContainer>
            <StyledTitle>
              <IconPaint size={theme.icon.size.md} />
              {t`Layout customization`}
            </StyledTitle>
            <SaveAndCancelButtons
              onSave={handleSave}
              onCancel={cancelEditMode}
              isSaveDisabled={!isDirty || isSaving}
              isLoading={isSaving}
              inverted
              saveIcon={IconCheck}
            />
          </StyledContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
