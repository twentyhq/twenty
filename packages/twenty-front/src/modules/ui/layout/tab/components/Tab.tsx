import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import isPropValid from '@emotion/is-prop-valid';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, IconComponent, Pill } from 'twenty-ui';

type TabProps = {
  id: string;
  title: string;
  Icon?: IconComponent;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  pill?: string | ReactElement;
  to?: string;
  logo?: string;
};

const StyledTab = styled('button', {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'active',
})<{ active?: boolean; disabled?: boolean; to?: string }>`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-color: ${({ theme, active }) =>
    active ? theme.border.color.inverted : 'transparent'};
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  border-left: none;
  border-right: none;
  border-top: none;

  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  margin-bottom: 0;
  padding: ${({ theme }) => theme.spacing(2) + ' 0'};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
  text-decoration: none;
`;

const StyledHover = styled.span`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
  &:active {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

export const Tab = ({
  id,
  title,
  Icon,
  active = false,
  onClick,
  className,
  disabled,
  pill,
  to,
  logo,
}: TabProps) => {
  const theme = useTheme();
  const iconColor = active
    ? theme.font.color.primary
    : theme.font.color.secondary;

  return (
    <StyledTab
      onClick={onClick}
      active={active}
      className={className}
      disabled={disabled}
      data-testid={'tab-' + id}
      as={to ? Link : 'button'}
      to={to}
    >
      <StyledHover>
        <StyledIconContainer>
          {logo && (
            <Avatar
              avatarUrl={logo}
              size="md"
              placeholder={title}
              iconColor={iconColor}
            />
          )}
          {Icon && (
            <Avatar
              Icon={Icon}
              size="md"
              placeholder={title}
              iconColor={iconColor}
            />
          )}
        </StyledIconContainer>
        <EllipsisDisplay>{title}</EllipsisDisplay>
        {pill && typeof pill === 'string' ? <Pill label={pill} /> : pill}
      </StyledHover>
    </StyledTab>
  );
};
