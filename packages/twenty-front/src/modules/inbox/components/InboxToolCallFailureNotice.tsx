import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNotice = styled.div`
  border-left: 2px solid ${themeCssVariables.color.red};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.color.red};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-right: ${themeCssVariables.spacing[1]};
`;

type InboxToolCallFailureNoticeProps = {
  error: string | null | undefined;
};

export const InboxToolCallFailureNotice = ({
  error,
}: InboxToolCallFailureNoticeProps) => {
  const { t } = useLingui();

  return (
    <StyledNotice role="alert">
      <StyledLabel>{t`Failed`}</StyledLabel>
      {isNonEmptyString(error) ? error : t`This step failed`}
    </StyledNotice>
  );
};
