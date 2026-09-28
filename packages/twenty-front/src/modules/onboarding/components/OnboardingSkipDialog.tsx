import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { getOnboardingCreditsRewardAriaLabel } from '@/onboarding/utils/getOnboardingCreditsRewardAriaLabel';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, MainButton } from 'twenty-ui/components';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledHeader = styled(Dialog.Header)`
  align-items: center;
  position: relative;
  text-align: center;
`;

const StyledCloseButton = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[3]};
  top: ${themeCssVariables.spacing[3]};
`;

const StyledVisual = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

type OnboardingSkipDialogAction = {
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
  creditsReward: number;
  onSkip: () => void;
};

export const OnboardingSkipDialog = ({
  dialogId,
  visual,
  title,
  description,
  actions,
  creditsReward,
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

  const creditsRewardChip = (
    <OnboardingCreditsRewardChip creditsReward={creditsReward} />
  );

  return (
    <DialogInstance dialogId={dialogId} dismissible renderInDocumentBody>
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="compact"
          initialFocus={firstActionRef}
          data-globally-prevent-click-outside
        >
          <StyledHeader>
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
            <Dialog.Title>{title}</Dialog.Title>
            {isDefined(description) && (
              <Dialog.Description>{description}</Dialog.Description>
            )}
          </StyledHeader>
          <Dialog.Footer>
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
                endIcon={creditsReward > 0 ? creditsRewardChip : undefined}
                aria-label={getOnboardingCreditsRewardAriaLabel({
                  label: action.label,
                  creditsReward,
                })}
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
          </Dialog.Footer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
