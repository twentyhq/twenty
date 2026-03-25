import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

export const WorkspaceDecorator: Decorator = (Story) => {
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  useEffect(() => {
    setCurrentWorkspace(mockCurrentWorkspace);
  }, [setCurrentWorkspace]);
  return <Story />;
};
