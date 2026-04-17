import { LayoutCustomizationBarMenuDropdown } from '@/layout-customization/components/LayoutCustomizationBarMenuDropdown';
import { LayoutCustomizationBarResetConfirmationModal } from '@/layout-customization/components/LayoutCustomizationBarResetConfirmationModal';
import { useCancelLayoutCustomization } from '@/layout-customization/hooks/useCancelLayoutCustomization';
import { useCurrentRecordPageLayoutInCustomization } from '@/layout-customization/hooks/useCurrentRecordPageLayoutInCustomization';
import { useIsLayoutCustomizationDirty } from '@/layout-customization/hooks/useIsLayoutCustomizationDirty';
import { useSaveLayoutCustomization } from '@/layout-customization/hooks/useSaveLayoutCustomization';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import { IconCheck } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledLeftSection = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.span`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  text-align: center;
`;

const StyledRightSection = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const LayoutCustomizationBarContent = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const { save, isSaving } = useSaveLayoutCustomization();
  const { cancel } = useCancelLayoutCustomization();
  const { isDirty } = useIsLayoutCustomizationDirty();

  const currentRecordPageLayout = useCurrentRecordPageLayoutInCustomization();

  const title =
    currentRecordPageLayout !== null
      ? t`${currentRecordPageLayout.objectLabelPlural} layout edition`
      : t`Layout customization`;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        duration: theme.animation.duration.normal,
        ease: 'easeInOut',
      }}
    >
      <StyledContainer data-globally-prevent-click-outside="true">
        <StyledLeftSection>
          <LayoutCustomizationBarMenuDropdown />
        </StyledLeftSection>
        <StyledTitle>{title}</StyledTitle>
        <StyledRightSection>
          <SaveAndCancelButtons
            onSave={save}
            onCancel={cancel}
            isSaveDisabled={!isDirty || isSaving}
            isCancelDisabled={isSaving}
            isLoading={isSaving}
            inverted
            saveIcon={IconCheck}
          />
        </StyledRightSection>
      </StyledContainer>
      <LayoutCustomizationBarResetConfirmationModal />
    </motion.div>
  );
};

export const LayoutCustomizationBar = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <AnimatePresence>
      {isLayoutCustomizationModeEnabled && <LayoutCustomizationBarContent />}
    </AnimatePresence>
  );
};
