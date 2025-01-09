import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const useCommandMenuOnItemClick = () => {
  const { toggleCommandMenu } = useCommandMenu();
  const navigate = useNavigate();

  const onItemClick = useCallback(
    ({
      shouldCloseCommandMenuOnClick,
      onClick,
      to,
    }: {
      shouldCloseCommandMenuOnClick?: boolean;
      onClick?: () => void;
      to?: string;
    }) => {
      if (
        isDefined(shouldCloseCommandMenuOnClick) &&
        shouldCloseCommandMenuOnClick
      ) {
        toggleCommandMenu();
      }

      if (isDefined(onClick)) {
        onClick();
        return;
      }
      if (isNonEmptyString(to)) {
        navigate(to);
        return;
      }
    },
    [navigate, toggleCommandMenu],
  );

  return { onItemClick };
};
