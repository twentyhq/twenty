import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { IconArrowUpRight } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

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
  Icon?: IconComponent;
  shortcuts?: Array<string>;
};

export const CommandMenuItem = ({
  label,
  to,
  onClick,
  Icon,
  shortcuts,
}: OwnProps) => {
  const navigate = useNavigate();
  const { closeCommandMenu } = useCommandMenu();
  const theme = useTheme();

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
        <StyledIconContainer>
          {Icon && <Icon size={theme.icon.size.sm} />}
        </StyledIconContainer>
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
};
