import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { OnboardingRewardCreditsChip } from '@/onboarding/components/OnboardingRewardCreditsChip';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, MainButton } from 'twenty-ui/components';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog, type DialogPopupProps } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledPopup = styled(Dialog.Popup)`
  && {
    align-items: center;
    inline-size: 360px;
    padding: ${themeCssVariables.spacing[6]};
    position: relative;
    text-align: center;
  }
`;

const StyledCloseButton = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[3]};
  top: ${themeCssVariables.spacing[3]};
`;

const StyledVisual = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledTitle = styled(Dialog.Title)`
  && {
    margin-block-end: 0;
  }
`;

const StyledActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export type OnboardingSkipDialogAction = {
  label: string;
  Icon?: IconComponent;
  onClick: () => void;
};

type OnboardingSkipDialogProps = {
  dialogId: string;
  visual: ReactNode;
  title: string;
  description?: string;
  actions: OnboardingSkipDialogAction[];
  rewardCredits: number;
  isRewardPerItem?: boolean;
  finalFocus?: DialogPopupProps['finalFocus'];
  onSkip: () => void;
};

export const OnboardingSkipDialog = ({
  dialogId,
  visual,
  title,
  description,
  actions,
  rewardCredits,
  isRewardPerItem = false,
  finalFocus,
  onSkip,
}: OnboardingSkipDialogProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { closeDialog } = useDialog();
  const firstActionRef = useRef<HTMLButtonElement>(null);

  const runAction = (action: OnboardingSkipDialogAction) => {
    closeDialog(dialogId);
    action.onClick();
  };

  const rewardCreditsChip = (
    <OnboardingRewardCreditsChip
      rewardCredits={rewardCredits}
      isRewardPerItem={isRewardPerItem}
    />
  );

  return (
    <DialogInstance dialogId={dialogId} dismissible renderInDocumentBody>
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <StyledPopup
          {...{ container, backdrop, viewportProps, onKeyDown, finalFocus }}
          initialFocus={firstActionRef}
          data-globally-prevent-click-outside
        >
          <StyledCloseButton>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={t`Close`}
              onClick={() => closeDialog(dialogId)}
            >
              <IconX />
            </IconButton>
          </StyledCloseButton>
          <StyledVisual>{visual}</StyledVisual>
          <StyledText>
            <StyledTitle>{title}</StyledTitle>
            {isDefined(description) && (
              <Dialog.Description>{description}</Dialog.Description>
            )}
          </StyledText>
          <StyledActions>
            {actions.map((action, index) => (
              <MainButton
                key={action.label}
                ref={index === 0 ? firstActionRef : undefined}
                fullWidth
                onClick={() => runAction(action)}
                startIcon={
                  isDefined(action.Icon) ? (
                    <action.Icon size={theme.icon.size.md} />
                  ) : undefined
                }
                endIcon={rewardCredits > 0 ? rewardCreditsChip : undefined}
              >
                {action.label}
              </MainButton>
            ))}
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                closeDialog(dialogId);
                onSkip();
              }}
            >
              {t`Skip anyway`}
            </Button>
          </StyledActions>
        </StyledPopup>
      )}
    </DialogInstance>
  );
};
