import React from 'react';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { IconArrowUpRight } from '@/ui/icons';

import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

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
  const setIsCommandMenuOpened = useSetRecoilState(isCommandMenuOpenedState);
  const navigate = useNavigate();

  if (to && !icon) {
    icon = <IconArrowUpRight />;
  }

  const onItemClick = () => {
    setIsCommandMenuOpened(false);

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
