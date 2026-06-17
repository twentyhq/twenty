import { type MouseEvent, type ReactElement, useContext } from 'react';
import { styled } from '@linaria/react';
import {
  type Avatar,
  type AvatarProps,
  type IconComponent,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNonClickableStartIcon = styled.div`
  align-items: center;
  background: transparent;
  border: none;

  display: flex;
  flex-direction: row;

  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};

  justify-content: center;
  white-space: nowrap;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledAvatarWrapper = styled.div`
  padding: ${themeCssVariables.spacing[1]};
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
  const { theme } = useContext(ThemeContext);
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
