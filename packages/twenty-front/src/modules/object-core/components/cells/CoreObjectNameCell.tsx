import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

type CoreObjectNameCellProps = {
  name: string | null | undefined;
  Icon: IconComponent;
};

export const CoreObjectNameCell = ({ name, Icon }: CoreObjectNameCellProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <Icon size={16} />
      </StyledIconContainer>
      <OverflowingTextWithTooltip
        text={isNonEmptyString(name) ? name : t`Untitled`}
      />
    </StyledContainer>
  );
};
