import * as React from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { activeTabIdScopedState } from '../states/activeTabIdScopedState';

import { Tab } from './Tab';

type SingleTabProps = {
  title: string;
  icon?: React.ReactNode;
  id: string;
};

type OwnProps = {
  tabs: SingleTabProps[];
  context: React.Context<string | null>;
};

export function TabList({ tabs, context }: OwnProps) {
  const initialActiveTabId = tabs[0].id;

  const [activeTabId, setActiveTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    context,
  );

  React.useEffect(() => {
    setActiveTabId(initialActiveTabId);
  }, [initialActiveTabId, setActiveTabId]);

  return (
    <>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          title={tab.title}
          icon={tab.icon}
          active={tab.id === activeTabId}
          onClick={() => {
            setActiveTabId(tab.id);
          }}
        />
      ))}
    </>
  );
}
