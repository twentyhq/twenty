import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconTransform } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledIndicatorContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AiChatCompactionIndicator = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledIndicatorContainer>
      <IconTransform size={theme.icon.size.sm} />
      <div>{t`The conversation has been compacted`}</div>
    </StyledIndicatorContainer>
  );
};
