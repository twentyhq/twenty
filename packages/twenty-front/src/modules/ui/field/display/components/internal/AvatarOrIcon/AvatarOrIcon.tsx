import { getAvatarButtonRender } from '@/ui/field/display/utils/getAvatarButtonRender';
import { t } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { isNonEmptyString } from '@sniptt/guards';

import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';
import { type AvatarOrIconProps } from './types/AvatarOrIconProps';
import { isDefined } from 'twenty-shared/utils';

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
      background: none;
      border: 0;
      border-radius: var(--t-border-radius-sm);
      color: inherit;
      cursor: pointer;
      font: inherit;
      margin: 0;
      padding: 0;
    }
    &:focus-visible {
      outline: 2px solid var(--t-color-blue);
      outline-offset: 1px;
    }
    &:disabled {
      cursor: inherit;
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
        render={getAvatarButtonRender({ name, onClick })}
      />
    );
  }

  const accessibleLabel = isNonEmptyString(name) ? name : t`Avatar`;

  const iconContent =
    isIconInverted || isDefined(IconBackgroundColor) ? (
      <span
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
      </span>
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
      <button
        type="button"
        className={styles.wrapper}
        data-clickable={true}
        aria-label={accessibleLabel}
        onClick={onClick}
      >
        {iconContent}
      </button>
    );
  }

  return <div className={styles.wrapper}>{iconContent}</div>;
};
