import { Avatar, AvatarProps, IconComponent, LightIconButton } from 'twenty-ui';
import { MouseEvent, ReactElement } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

const StyledNonClickableStartIcon = styled.div`
  align-items: center;
  background: transparent;
  border: none;

  display: flex;
  flex-direction: row;

  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;

  white-space: nowrap;
  height: ${({ theme }) => theme.spacing(6)};
  width: ${({ theme }) => theme.spacing(6)};
`;

const StyledAvatarWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const DropdownMenuHeaderStartIcon = ({
  onClick,
  ...props
}: { onClick?: (event: MouseEvent<HTMLButtonElement>) => void } & (
  | { StartIcon: IconComponent }
  | {
      StartAvatar: ReactElement<AvatarProps, typeof Avatar>;
    }
  | Record<never, never>
)) => {
  const theme = useTheme();

  return (
    <>
      {'StartIcon' in props &&
        (onClick ? (
          <LightIconButton
            Icon={props.StartIcon}
            accent="tertiary"
            size="small"
            onClick={onClick}
          />
        ) : (
          <StyledNonClickableStartIcon>
            <props.StartIcon
              size={theme.icon.size.sm}
              color={theme.font.color.tertiary}
            />
          </StyledNonClickableStartIcon>
        ))}

      {'StartAvatar' in props && (
        <StyledAvatarWrapper>{props.StartAvatar}</StyledAvatarWrapper>
      )}
    </>
  );
};
