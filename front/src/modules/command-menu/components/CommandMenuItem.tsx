import React, { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconArrowUpRight } from '@/ui/icon';

import { useCommandMenu } from '../hooks/useCommandMenu';

import {
  StyledIconAndLabelContainer,
  StyledIconContainer,
  StyledMenuItem,
  StyledShortCut,
  StyledShortcutsContainer,
} from './CommandMenuStyles';

export type OwnProps<T> = {
  label: string;
  to?: string;
  key: string;
  onClick?: () => void;
  Icon?: ComponentType<T>;
  iconProps?: T;
  shortcuts?: Array<string>;
};

export function CommandMenuItem<T extends Record<string, unknown>>({
  label,
  to,
  onClick,
  Icon,
  iconProps,
  shortcuts,
}: OwnProps<T>) {
  const navigate = useNavigate();
  const { closeCommandMenu } = useCommandMenu();

  if (to && !Icon) {
    Icon = IconArrowUpRight;
  }

  const onItemClick = () => {
    closeCommandMenu();

    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
  };

  return (
    <StyledMenuItem onSelect={onItemClick}>
      <StyledIconAndLabelContainer>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <StyledIconContainer>{<Icon {...iconProps} />}</StyledIconContainer>
        {label}
      </StyledIconAndLabelContainer>
      <StyledShortcutsContainer>
        {shortcuts &&
          shortcuts.map((shortcut, index) => {
            const prefix = index > 0 ? 'then' : '';
            return (
              <React.Fragment key={index}>
                {prefix}
                <StyledShortCut>{shortcut}</StyledShortCut>
              </React.Fragment>
            );
          })}
      </StyledShortcutsContainer>
    </StyledMenuItem>
  );
}
