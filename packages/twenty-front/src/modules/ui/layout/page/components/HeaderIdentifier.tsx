import { StyledHeaderIdentifierLabel } from '@/ui/layout/page/components/StyledHeaderIdentifierLabel';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  AVATAR_PROPERTIES_BY_SIZE,
  Avatar,
  type AvatarProps,
} from 'twenty-ui/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const HEADER_IDENTIFIER_TILE_SIZE = AVATAR_PROPERTIES_BY_SIZE.lg.width;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledIcon = styled.div<{ iconColor?: string }>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${({ iconColor }) => iconColor ?? ''};
  display: flex;
  flex-shrink: 0;
  height: ${HEADER_IDENTIFIER_TILE_SIZE};
  justify-content: center;
  width: ${HEADER_IDENTIFIER_TILE_SIZE};
`;

const StyledTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTitle = styled.h3<{ fontSize: 'md' | 'lg' }>`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${({ fontSize }) => themeCssVariables.font.size[fontSize]};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
  min-width: 0;
  overflow: hidden;
`;

type HeaderIdentifierProps = {
  avatar?: Pick<
    AvatarProps,
    'avatarUrl' | 'onClick' | 'placeholder' | 'placeholderColorSeed' | 'type'
  >;
  icon?: ReactNode;
  iconColor?: string;
  fontSize?: 'md' | 'lg';
  title: ReactNode;
  label?: ReactNode;
};

export const HeaderIdentifier = ({
  avatar,
  icon,
  iconColor,
  fontSize = 'md',
  title,
  label,
}: HeaderIdentifierProps) => {
  const identifierIcon = isDefined(avatar) ? (
    <Avatar
      avatarUrl={avatar.avatarUrl}
      onClick={avatar.onClick}
      placeholder={avatar.placeholder}
      placeholderColorSeed={avatar.placeholderColorSeed}
      type={avatar.type}
      size={fontSize}
    />
  ) : (
    icon
  );

  const shouldRenderInTile = !isDefined(avatar) || fontSize === 'md';

  return (
    <StyledContainer>
      {isDefined(identifierIcon) &&
        (shouldRenderInTile ? (
          <StyledIcon iconColor={iconColor}>{identifierIcon}</StyledIcon>
        ) : (
          identifierIcon
        ))}
      <StyledTextContainer>
        <StyledTitle fontSize={fontSize}>
          {typeof title === 'string' ? (
            <OverflowingTextWithTooltip text={title} />
          ) : (
            title
          )}
        </StyledTitle>
        {isDefined(label) && (
          <StyledHeaderIdentifierLabel>{label}</StyledHeaderIdentifierLabel>
        )}
      </StyledTextContainer>
    </StyledContainer>
  );
};
