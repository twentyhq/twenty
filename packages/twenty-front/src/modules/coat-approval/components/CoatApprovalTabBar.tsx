import { type CoatTab } from '@/coat-approval/types/coat-approval.types';
import styled from '@emotion/styled';

type CoatApprovalTabBarProps = {
  activeTab: CoatTab;
  onTabChange: (tab: CoatTab) => void;
};

type TabDefinition = {
  key: CoatTab;
  label: string;
};

const TABS: TabDefinition[] = [
  { key: 'analyze', label: 'Analyze for Export' },
  { key: 'all', label: 'All Contracts' },
  { key: 'warnings', label: 'Warnings' },
];

const StyledTabBarContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-shrink: 0;
  gap: 0;
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: ${({ theme, isActive }) =>
    isActive ? theme.background.primary : 'transparent'};
  border: none;
  border-bottom: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.color.blue : 'transparent'};
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary};
  cursor: pointer;
  flex: 1;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme, isActive }) =>
    isActive ? theme.font.weight.medium : theme.font.weight.regular};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export const CoatApprovalTabBar = ({
  activeTab,
  onTabChange,
}: CoatApprovalTabBarProps) => {
  return (
    <StyledTabBarContainer>
      {TABS.map((tab) => (
        <StyledTab
          key={tab.key}
          isActive={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </StyledTab>
      ))}
    </StyledTabBarContainer>
  );
};
