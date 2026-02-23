import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { type Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

export const WorkspaceDecorator: Decorator = (Story) => {
  const setCurrentWorkspace = useSetRecoilStateV2(currentWorkspaceState);

  useEffect(() => {
    setCurrentWorkspace(mockCurrentWorkspace);
  }, [setCurrentWorkspace]);
  return <Story />;
};
