import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

// The 6px inset centers the cap on the 16px column message avatars use
const StyledUnreadLine = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 10px;
  padding-left: 6px;
`;

const StyledRule = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  height: 4px;

  &::before {
    background: ${themeCssVariables.font.color.danger};
    content: '';
    flex-shrink: 0;
    height: 4px;
    width: 4px;
  }

  &::after {
    background: ${themeCssVariables.font.color.danger};
    content: '';
    flex: 1;
    height: 1.5px;
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1;
`;

export const AiChatUnreadLine = () => {
  const { t } = useLingui();

  return (
    <StyledUnreadLine role="separator" aria-label={t`New messages`}>
      <StyledRule />
      <StyledLabel>{t`New`}</StyledLabel>
    </StyledUnreadLine>
  );
};
