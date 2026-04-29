import { styled } from '@linaria/react';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { t } from '@lingui/core/macro';
import { IconArrowBackUp } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFooterWarning = styled.span`
  color: ${themeCssVariables.color.red};
  flex: 1;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledComposerContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

const StyledFooterActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type EmailComposerProps = {
  connectedAccountId: string;
  defaultTo?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  onClose?: () => void;
  onSent?: () => void;
};

export const EmailComposer = ({
  connectedAccountId,
  defaultTo = '',
  defaultSubject = '',
  defaultInReplyTo,
  onClose,
  onSent,
}: EmailComposerProps) => {
  const composerState = useEmailComposerState({
    connectedAccountId,
    defaultTo,
    defaultSubject,
    defaultInReplyTo,
    onSent,
  });

  return (
    <StyledComposerContainer>
      <EmailComposerFields composerState={composerState} />
      <StyledFooter>
        {composerState.exceedsRecipientLimit && (
          <StyledFooterWarning>
            {t`Too many recipients (${composerState.recipientCount}/${composerState.maxRecipients}).`}
          </StyledFooterWarning>
        )}
        <StyledFooterActions>
          {onClose && (
            <Button
              size="small"
              variant="secondary"
              title={t`Cancel`}
              onClick={onClose}
            />
          )}
          <Button
            size="small"
            variant="primary"
            accent="blue"
            title={t`Send`}
            Icon={IconArrowBackUp}
            onClick={composerState.handleSend}
            disabled={!composerState.canSend}
          />
        </StyledFooterActions>
      </StyledFooter>
    </StyledComposerContainer>
  );
};
