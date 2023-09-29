import * as React from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { activeTabIdScopedState } from '../states/activeTabIdScopedState';

import { Tab } from './Tab';

type SingleTabProps = {
  title: string;
  Icon?: IconComponent;
  id: string;
  hide?: boolean;
  disabled?: boolean;
};

type TabListProps = {
  tabs: SingleTabProps[];
  context: React.Context<string | null>;
};

const StyledContainer = styled.div`
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  user-select: none;
`;

export const TabList = ({ tabs, context }: TabListProps) => {
  const initialActiveTabId = tabs[0].id;

  const [activeTabId, setActiveTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    context,
  );

  React.useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  return (
    <StyledContainer>
      {tabs
        .filter((tab) => !tab.hide)
        .map((tab) => (
          <Tab
            id={tab.id}
            key={tab.id}
            title={tab.title}
            Icon={tab.Icon}
            active={tab.id === activeTabId}
            onClick={() => {
              setActiveTabId(tab.id);
            }}
            disabled={tab.disabled}
          />
        ))}
    </StyledContainer>
  );
};
