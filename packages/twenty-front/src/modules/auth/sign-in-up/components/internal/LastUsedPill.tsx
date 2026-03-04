import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Pill } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPillContainer = styled.span`
  position: absolute;
  right: calc(-1 * ${themeCssVariables.spacing[5]});
  top: calc(-1 * ${themeCssVariables.spacing[2]});

  > span {
    background: ${themeCssVariables.color.blue3};
    border: 1px solid ${themeCssVariables.color.blue5};
    border-radius: ${themeCssVariables.border.radius.pill};
    color: ${themeCssVariables.color.blue};
    font-weight: ${themeCssVariables.font.weight.semiBold};
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
