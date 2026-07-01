import { css, cx } from '@linaria/core';
import { type MouseEventHandler, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsTextLinkVariant = 'primary' | 'secondary';

type SettingsTextLinkCommonProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: SettingsTextLinkVariant;
};

type SettingsTextLinkProps =
  | (SettingsTextLinkCommonProps & {
      disabled?: boolean;
      onClick?: MouseEventHandler<HTMLButtonElement>;
      to?: undefined;
    })
  | (SettingsTextLinkCommonProps & {
      disabled?: never;
      onClick?: MouseEventHandler<HTMLAnchorElement>;
      to: LinkProps['to'];
    });

const settingsTextLinkBaseClassName = css`
  background: none;
  border: 0;
  cursor: pointer;
  font: inherit;
  margin: 0;
  overflow: hidden;
  padding: 0;
  text-decoration: underline;
  text-overflow: ellipsis;
  text-underline-offset: 2px;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const settingsTextLinkPrimaryClassName = css`
  color: ${themeCssVariables.font.color.primary};
  text-decoration-color: ${themeCssVariables.border.color.strong};

  &:not(:disabled):hover {
    color: ${themeCssVariables.color.blue};
    text-decoration-color: ${themeCssVariables.color.blue};
  }
`;

const settingsTextLinkSecondaryClassName = css`
  color: ${themeCssVariables.font.color.tertiary};
  text-decoration-color: ${themeCssVariables.font.color.tertiary};

  &:not(:disabled):hover {
    color: ${themeCssVariables.color.blue};
    text-decoration-color: ${themeCssVariables.color.blue};
  }
`;

export const SettingsTextLink = ({
  children,
  className,
  title,
  variant = 'primary',
  ...props
}: SettingsTextLinkProps) => {
  const textLinkClassName = cx(
    settingsTextLinkBaseClassName,
    variant === 'primary'
      ? settingsTextLinkPrimaryClassName
      : settingsTextLinkSecondaryClassName,
    className,
  );

  if (props.to !== undefined) {
    return (
      <Link
        className={textLinkClassName}
        onClick={props.onClick}
        title={title}
        to={props.to}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={textLinkClassName}
      disabled={props.disabled ?? false}
      onClick={props.onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
};
