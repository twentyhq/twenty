import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { OnboardingRewardMainButton } from '@/onboarding/components/OnboardingRewardMainButton';
import { type OnboardingRewardAction } from '@/onboarding/types/OnboardingRewardAction';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog, type DialogPopupProps } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

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

type OnboardingSkipDialogProps = {
  dialogId: string;
  visual: ReactNode;
  title: string;
  description?: string;
  actions: OnboardingRewardAction[];
  finalFocus?: DialogPopupProps['finalFocus'];
  onSkip: () => void;
};

export const OnboardingSkipDialog = ({
  dialogId,
  visual,
  title,
  description,
  actions,
  finalFocus,
  onSkip,
}: OnboardingSkipDialogProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const firstActionRef = useRef<HTMLButtonElement>(null);

  const runAction = (action: OnboardingRewardAction) => {
    closeDialog(dialogId);
    action.onClick();
  };

  return (
    <DialogInstance dialogId={dialogId} dismissible renderInDocumentBody>
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="compact"
          initialFocus={firstActionRef}
          finalFocus={finalFocus}
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
              <OnboardingRewardMainButton
                key={action.label}
                ref={index === 0 ? firstActionRef : undefined}
                label={action.label}
                Icon={action.Icon}
                creditsReward={action.creditsReward}
                isRewardPerItem={action.isRewardPerItem}
                onClick={() => runAction(action)}
              />
            ))}
            <Button
              variant="ghost"
              fullWidth
              data-testid="onboarding-skip-dialog-skip-anyway"
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
