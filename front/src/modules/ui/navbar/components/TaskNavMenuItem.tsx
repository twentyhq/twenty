import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { NavItemProps } from '@/ui/navbar/components/NavItem';
import {
  StyledItem,
  StyledItemCount,
  StyledItemLabel,
} from '@/ui/navbar/components/StyledNavItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { isNavbarOpenedState } from '../../layout/states/isNavbarOpenedState';

function NavItem({ label, Icon, to, onClick, active, danger }: NavItemProps) {
  const navigate = useNavigate();
  const [, setIsNavbarOpened] = useRecoilState(isNavbarOpenedState);

  const { todayOrPreviousTasks } = useTasks();

  const dueTasks = todayOrPreviousTasks?.filter(
    (task) => task.author.id === task.assignee?.id,
  )?.length;

  const isMobile = useIsMobile();

  function handleItemClick() {
    if (isMobile) {
      setIsNavbarOpened(false);
    }

    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  }

  return (
    <StyledItem
      onClick={handleItemClick}
      active={active}
      aria-selected={active}
      danger={danger}
    >
      {Icon && <Icon />}
      <StyledItemLabel>{label}</StyledItemLabel>
      {dueTasks && dueTasks > 0 ? (
        <StyledItemCount>{dueTasks}</StyledItemCount>
      ) : (
        ''
      )}
    </StyledItem>
  );
}

export default NavItem;
