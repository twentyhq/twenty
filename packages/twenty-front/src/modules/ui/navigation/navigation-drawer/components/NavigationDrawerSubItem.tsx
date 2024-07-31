import {
  NavigationDrawerItem,
  NavigationDrawerItemProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import styled from '@emotion/styled';

const StyledItem = styled.div`
  margin-left: ${({ theme }) => theme.spacing(4)};
`;

type NavigationDrawerSubItemProps = NavigationDrawerItemProps;

export const NavigationDrawerSubItem = ({
  className,
  label,
  level = 1,
  Icon,
  to,
  onClick,
  active,
  danger,
  soon,
  count,
  keyboard,
}: NavigationDrawerSubItemProps) => {
  return (
    <StyledItem>
      <NavigationDrawerItem
        className={className}
        label={label}
        level={level}
        Icon={Icon}
        to={to}
        onClick={onClick}
        active={active}
        danger={danger}
        soon={soon}
        count={count}
        keyboard={keyboard}
      />
    </StyledItem>
  );
};
