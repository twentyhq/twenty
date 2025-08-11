import { useSetRecoilState } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { useEffect } from 'react';
import { type Decorator } from '@storybook/react';

export const WorkspaceDecorator: Decorator = (Story) => {
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  useEffect(() => {
    setCurrentWorkspace(mockCurrentWorkspace);
  }, [setCurrentWorkspace]);
  return <Story />;
};
