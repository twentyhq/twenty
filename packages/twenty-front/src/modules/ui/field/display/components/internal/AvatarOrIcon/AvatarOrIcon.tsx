import { css } from '@linaria/core';
import { isNonEmptyString } from '@sniptt/guards';

import { handleClickableElementKeyDown } from 'twenty-ui/primitives/accessibility';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-ui/utilities';
import { type AvatarOrIconProps } from './types/AvatarOrIconProps';

const styles = {
  iconWithBackgroundContainer: css`
    & {
      align-items: center;
      background-color: var(
        --avatar-or-icon-background,
        var(--t-background-inverted-secondary)
      );
      border-radius: var(--t-border-radius-sm);
      display: flex;
      height: 14px;
      justify-content: center;
      width: 14px;
    }
  `,
  wrapper: css`
    & {
      cursor: inherit;
      display: flex;
    }
    &[data-clickable] {
      cursor: pointer;
    }
  `,
};

export const AvatarOrIcon = ({
  Icon,
  colorSeed,
  shape,
  src,
  name,
  isIconInverted = false,
  IconColor,
  IconBackgroundColor,
  onClick,
}: AvatarOrIconProps) => {
  const theme = useTheme();

  if (!isDefined(Icon)) {
    return (
      <Avatar
        src={src}
        colorSeed={colorSeed}
        name={name}
        size="sm"
        shape={shape ?? undefined}
        onClick={onClick}
      />
    );
  }

  const accessibleLabel = isNonEmptyString(name) ? name : 'Avatar';

  const iconContent =
    isIconInverted || isDefined(IconBackgroundColor) ? (
      <div
        className={styles.iconWithBackgroundContainer}
        style={
          isDefined(IconBackgroundColor)
            ? ({
                '--avatar-or-icon-background': IconBackgroundColor,
              } as React.CSSProperties)
            : undefined
        }
      >
        <Icon
          color={theme.font.color.inverted}
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
          aria-hidden
        />
      </div>
    ) : (
      <Icon
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={IconColor || 'currentColor'}
        aria-hidden
      />
    );

  if (isDefined(onClick)) {
    return (
      <div
        className={styles.wrapper}
        data-clickable={true}
        role="button"
        tabIndex={0}
        aria-label={accessibleLabel}
        onClick={onClick}
        onKeyDown={handleClickableElementKeyDown}
      >
        {iconContent}
      </div>
    );
  }

  return <div className={styles.wrapper}>{iconContent}</div>;
};
