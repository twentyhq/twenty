import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
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
  avatar?: ReactNode;
};

export const CoreObjectNameCell = ({
  name,
  avatarColorSeed,
  avatarShape,
  Icon,
  avatar,
}: CoreObjectNameCellProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const defaultAvatar = isDefined(Icon) ? (
    <Icon aria-hidden size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
  ) : (
    <Avatar
      name={name ?? undefined}
      colorSeed={avatarColorSeed}
      size="sm"
      shape={avatarShape}
    />
  );

  return (
    <StyledContainer>
      <StyledAvatarContainer>{avatar ?? defaultAvatar}</StyledAvatarContainer>
      <OverflowingTextWithTooltip
        text={isNonEmptyString(name) ? name : t`Untitled`}
      />
    </StyledContainer>
  );
};
