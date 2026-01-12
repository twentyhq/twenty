import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

export const WorkspaceDecorator: Decorator = (Story) => {
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  useEffect(() => {
    setCurrentWorkspace(mockCurrentWorkspace);
  }, [setCurrentWorkspace]);
  return <Story />;
};
