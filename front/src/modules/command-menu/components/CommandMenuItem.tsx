import React from 'react';
import { ReactNode } from 'react';
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

export type OwnProps = {
  label: string;
  to?: string;
  key: string;
  onClick?: () => void;
  icon?: ReactNode;
  shortcuts?: Array<string>;
};

export function CommandMenuItem({
  label,
  to,
  onClick,
  icon,
  shortcuts,
}: OwnProps) {
  const navigate = useNavigate();
  const { closeCommandMenu } = useCommandMenu();

  if (to && !icon) {
    icon = <IconArrowUpRight />;
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
        <StyledIconContainer>{icon}</StyledIconContainer>
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
