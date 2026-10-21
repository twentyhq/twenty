import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPillContainer = styled.span`
  position: absolute;
  right: -14px;
  top: -10px;
`;

const StyledLastUsedBadge = styled(Badge)`
  border: 1px solid ${themeCssVariables.accent.accent5};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[5]};
`;

export const LastUsedPill = () => {
  const { t } = useLingui();

  return (
    <StyledPillContainer>
      <StyledLastUsedBadge color="accent">
        {t({
          message: 'Last',
          comment:
            'Short label (keep brief) indicating the most recently used login method',
        })}
      </StyledLastUsedBadge>
    </StyledPillContainer>
  );
};
