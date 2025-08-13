import { type MouseEvent, type ReactElement } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import {
  type Avatar,
  type AvatarProps,
  type IconComponent,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

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

export const DropdownMenuHeaderLeftComponent = ({
  onClick,
  ...props
}: { onClick?: (event: MouseEvent<HTMLButtonElement>) => void } & (
  | { Icon: IconComponent }
  | {
      Avatar: ReactElement<AvatarProps, typeof Avatar>;
    }
  | Record<never, never>
)) => {
  const theme = useTheme();

  return (
    <>
      {'Icon' in props &&
        (onClick ? (
          <LightIconButton
            Icon={props.Icon}
            accent="tertiary"
            size="small"
            onClick={onClick}
          />
        ) : (
          <StyledNonClickableStartIcon>
            <props.Icon
              size={theme.icon.size.sm}
              color={theme.font.color.tertiary}
            />
          </StyledNonClickableStartIcon>
        ))}

      {'Avatar' in props && (
        <StyledAvatarWrapper>{props.Avatar}</StyledAvatarWrapper>
      )}
    </>
  );
};
