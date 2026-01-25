import styled from '@emotion/styled';
import { useState } from 'react';
import {
    IconBuildingBank,
    IconCash,
    IconChartBar,
    IconCheck,
    IconChevronDown,
    IconFileCheck,
    IconHome,
    IconSettings,
    IconSpeakerphone,
    IconUser,
} from 'twenty-ui/display';

export type WorkspaceRole =
  | 'agent'
  | 'transaction-coordinator'
  | 'mortgage'
  | 'property-management'
  | 'marketing'
  | 'operations'
  | 'finance'
  | 'leadership';

type WorkspaceOption = {
  id: WorkspaceRole;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
};

const WORKSPACE_OPTIONS: WorkspaceOption[] = [
  {
    id: 'agent',
    label: 'Agent',
    icon: <IconUser size={20} />,
    description: 'Sales pipeline, transactions, commissions',
    color: '#3B82F6',
  },
  {
    id: 'transaction-coordinator',
    label: 'Transaction Coordinator',
    icon: <IconFileCheck size={20} />,
    description: 'Files, deadlines, compliance tracking',
    color: '#8B5CF6',
  },
  {
    id: 'mortgage',
    label: 'Mortgage',
    icon: <IconBuildingBank size={20} />,
    description: 'Loan pipeline, rate locks, underwriting',
    color: '#10B981',
  },
  {
    id: 'property-management',
    label: 'Property Management',
    icon: <IconHome size={20} />,
    description: 'Properties, tenants, maintenance',
    color: '#F59E0B',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: <IconSpeakerphone size={20} />,
    description: 'Campaigns, newsletters, social posts',
    color: '#EC4899',
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: <IconSettings size={20} />,
    description: 'Team management, system settings',
    color: '#6366F1',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: <IconCash size={20} />,
    description: 'Commissions, payroll, accounting',
    color: '#14B8A6',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    icon: <IconChartBar size={20} />,
    description: 'Company metrics, team performance',
    color: '#F97316',
  },
];

const Container = styled.div`
  position: relative;
  width: 280px;
`;

const SwitcherButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  ${({ isOpen, theme }) =>
    isOpen &&
    `
    border-color: ${theme.color.blue};
    box-shadow: 0 0 0 3px ${theme.color.blue}20;
  `}
`;

const IconWrapper = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${({ color }) => `${color}15`};
  border-radius: 8px;
  color: ${({ color }) => color};
`;

const ButtonContent = styled.div`
  flex: 1;
  text-align: left;
`;

const ButtonLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ButtonDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-top: 2px;
`;

const ChevronWrapper = styled.div<{ isOpen: boolean }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  transition: transform 0.2s;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  z-index: 1000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s;
  max-height: 400px;
  overflow-y: auto;
`;

const DropdownItem = styled.button<{ isSelected: boolean; color: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: ${({ isSelected, color }) => (isSelected ? `${color}10` : 'transparent')};
  border: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:first-of-type {
    border-radius: 8px 8px 0 0;
  }

  &:last-of-type {
    border-radius: 0 0 8px 8px;
  }
`;

const ItemContent = styled.div`
  flex: 1;
  text-align: left;
`;

const ItemLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ItemDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-top: 2px;
`;

const CheckWrapper = styled.div<{ color: string }>`
  color: ${({ color }) => color};
`;

type WorkspaceSwitcherProps = {
  currentWorkspace: WorkspaceRole;
  onWorkspaceChange: (workspace: WorkspaceRole) => void;
};

export const WorkspaceSwitcher = ({
  currentWorkspace,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = WORKSPACE_OPTIONS.find((opt) => opt.id === currentWorkspace);

  const handleSelect = (workspace: WorkspaceRole) => {
    onWorkspaceChange(workspace);
    setIsOpen(false);
  };

  if (!currentOption) return null;

  return (
    <Container>
      <SwitcherButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <IconWrapper color={currentOption.color}>{currentOption.icon}</IconWrapper>
        <ButtonContent>
          <ButtonLabel>{currentOption.label}</ButtonLabel>
          <ButtonDescription>{currentOption.description}</ButtonDescription>
        </ButtonContent>
        <ChevronWrapper isOpen={isOpen}>
          <IconChevronDown size={16} />
        </ChevronWrapper>
      </SwitcherButton>

      <Dropdown isOpen={isOpen}>
        {WORKSPACE_OPTIONS.map((option) => (
          <DropdownItem
            key={option.id}
            isSelected={option.id === currentWorkspace}
            color={option.color}
            onClick={() => handleSelect(option.id)}
          >
            <IconWrapper color={option.color}>{option.icon}</IconWrapper>
            <ItemContent>
              <ItemLabel>{option.label}</ItemLabel>
              <ItemDescription>{option.description}</ItemDescription>
            </ItemContent>
            {option.id === currentWorkspace && (
              <CheckWrapper color={option.color}>
                <IconCheck size={16} />
              </CheckWrapper>
            )}
          </DropdownItem>
        ))}
      </Dropdown>
    </Container>
  );
};
