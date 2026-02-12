import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCheck, useIcons } from 'twenty-ui/display';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useSaveNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useSaveNavigationMenuItemsDraft';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.inverted};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2, 3)};
  width: 100%;
`;

const StyledTitle = styled.span`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const NavigationMenuEditModeBar = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [isSaving, setIsSaving] = useState(false);
  const { closeCommandMenu } = useCommandMenu();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const setIsNavigationMenuInEditMode = useSetRecoilState(
    isNavigationMenuInEditModeState,
  );
  const { saveDraft } = useSaveNavigationMenuItemsDraft();
  const { isDirty } = useNavigationMenuItemsDraftState();

  const cancelEditMode = () => {
    setNavigationMenuItemsDraft(null);
    setSelectedNavigationMenuItemInEditMode(null);
    setIsNavigationMenuInEditMode(false);
  };

  const isNavigationMenuInEditMode = useRecoilValue(
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
      closeCommandMenu();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to save navigation layout`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const IconPaint = getIcon('IconPaint');

  if (!showNavigationMenuEditModeBar) {
    return null;
  }

  return (
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
  );
};
