import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDivider = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.blue};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  margin: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledRule = styled.div`
  background: ${themeCssVariables.color.blue};
  flex: 1;
  height: 1px;
  opacity: 0.4;
`;

export const AiChatUnreadDivider = () => {
  const { t } = useLingui();

  return (
    <StyledDivider>
      <StyledRule />
      <span>{t`New`}</span>
      <StyledRule />
    </StyledDivider>
  );
};
