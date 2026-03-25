import { css } from '@linaria/core';
import React from 'react';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const hoveredStyle = css`
  background: ${themeCssVariables.background.transparent.light};
`;

type CreateNewButtonProps = React.ComponentProps<typeof MenuItem> & {
  hovered?: boolean;
};

export const CreateNewButton = ({
  hovered,
  className,
  accent,
  withIconContainer,
  iconButtons,
  isIconDisplayedOnHoverOnly,
  isTooltipOpen,
  LeftIcon,
  LeftComponent,
  RightIcon,
  RightComponent,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  disabled,
  text,
  contextualTextPosition,
  contextualText,
  hasSubMenu,
  focused,
  hotKeys,
  isSubMenuOpened,
}: CreateNewButtonProps) => (
  <MenuItem
    accent={accent}
    withIconContainer={withIconContainer}
    iconButtons={iconButtons}
    isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
    isTooltipOpen={isTooltipOpen}
    LeftIcon={LeftIcon}
    LeftComponent={LeftComponent}
    RightIcon={RightIcon}
    RightComponent={RightComponent}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    testId={testId}
    disabled={disabled}
    text={text}
    contextualTextPosition={contextualTextPosition}
    contextualText={contextualText}
    hasSubMenu={hasSubMenu}
    focused={focused}
    hotKeys={hotKeys}
    isSubMenuOpened={isSubMenuOpened}
    className={`${className ?? ''} ${hovered ? hoveredStyle : ''}`}
  />
);
