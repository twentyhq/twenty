import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Avatar, type AvatarShape } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledAvatarContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

type CoreObjectNameCellProps = {
  name: string | null | undefined;
  avatarColorSeed: string;
  avatarShape: AvatarShape;
  Icon?: IconComponent;
};

export const CoreObjectNameCell = ({
  name,
  avatarColorSeed,
  avatarShape,
  Icon,
}: CoreObjectNameCellProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledAvatarContainer>
        {isDefined(Icon) ? (
          <span aria-hidden>
            <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          </span>
        ) : (
          <Avatar
            name={name ?? undefined}
            colorSeed={avatarColorSeed}
            size="sm"
            shape={avatarShape}
          />
        )}
      </StyledAvatarContainer>
      <OverflowingTextWithTooltip
        text={isNonEmptyString(name) ? name : t`Untitled`}
      />
    </StyledContainer>
  );
};
