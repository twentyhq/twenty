import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { TintedIconTile } from 'twenty-ui/data-display';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';
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
  iconColor?: ThemeColor;
};

export const CoreObjectNameCell = ({
  name,
  Icon,
  iconColor,
}: CoreObjectNameCellProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <TintedIconTile Icon={Icon} color={iconColor} size={16} />
      </StyledIconContainer>
      <OverflowingTextWithTooltip
        text={isNonEmptyString(name) ? name : t`Untitled`}
      />
    </StyledContainer>
  );
};
