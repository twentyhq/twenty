import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Tabs } from 'twenty-ui/primitives/navigation';

const StyledPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

type WorkflowStepTabPanelProps = {
  value: string;
  children: ReactNode;
};

export const WorkflowStepTabPanel = ({
  value,
  children,
}: WorkflowStepTabPanelProps) => (
  <Tabs.Panel value={value} render={<StyledPanel />}>
    {children}
  </Tabs.Panel>
);
