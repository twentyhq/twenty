import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Pill } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPillContainer = styled.span`
  position: absolute;
  right: -14px;
  top: -10px;

  > span {
    background: ${themeCssVariables.accent.accent3};
    border: 1px solid ${themeCssVariables.accent.accent5};
    border-radius: ${themeCssVariables.border.radius.pill};
    color: ${themeCssVariables.accent.accent9};
    corner-shape: round;
    font-weight: ${themeCssVariables.font.weight.semiBold};
    height: ${themeCssVariables.spacing[5]};
  }
`;

export const LastUsedPill = () => {
  const { t } = useLingui();

  return (
    <StyledPillContainer>
      <Pill
        label={t({
          message: 'Last',
          comment:
            'Short label (keep brief) indicating the most recently used login method',
        })}
      />
    </StyledPillContainer>
  );
};
