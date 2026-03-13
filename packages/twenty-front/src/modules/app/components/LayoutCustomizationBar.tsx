import { useCancelLayoutCustomization } from '@/app/hooks/useCancelLayoutCustomization';
import { useIsLayoutCustomizationDirty } from '@/app/hooks/useIsLayoutCustomizationDirty';
import { useSaveLayoutCustomization } from '@/app/hooks/useSaveLayoutCustomization';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import { IconCheck, useIcons } from 'twenty-ui/display';
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

const StyledTitle = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const LayoutCustomizationBarContent = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { save, isSaving } = useSaveLayoutCustomization();
  const { cancel } = useCancelLayoutCustomization();
  const { isDirty } = useIsLayoutCustomizationDirty();

  const IconPaint = getIcon('IconPaint');

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
      <StyledContainer>
        <StyledTitle>
          <IconPaint size={theme.icon.size.md} />
          {t`Layout customization`}
        </StyledTitle>
        <SaveAndCancelButtons
          onSave={save}
          onCancel={cancel}
          isSaveDisabled={!isDirty || isSaving}
          isLoading={isSaving}
          inverted
          saveIcon={IconCheck}
        />
      </StyledContainer>
    </motion.div>
  );
};

export const LayoutCustomizationBar = () => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  return (
    <AnimatePresence>
      {isLayoutCustomizationActive && <LayoutCustomizationBarContent />}
    </AnimatePresence>
  );
};
