import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { AppPath } from '@/types/AppPath';
import { isNavigationDrawerOpenState } from '@/ui/navigation/states/isNavigationDrawerOpenState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import {
  AppNavigationDrawer,
  AppNavigationDrawerProps,
} from '../AppNavigationDrawer';

const MobileNavigationDrawerStateSetterEffect = ({
  mobileNavigationDrawer = 'main',
}: {
  mobileNavigationDrawer?: 'main' | 'settings';
}) => {
  const isMobile = useIsMobile();
  const setIsNavigationDrawerOpen = useSetRecoilState(
    isNavigationDrawerOpenState,
  );
  const setCurrentMobileNavigationDrawer = useSetRecoilState(
    currentMobileNavigationDrawerState,
  );

  useEffect(() => {
    if (!isMobile) return;

    setIsNavigationDrawerOpen(true);
    setCurrentMobileNavigationDrawer(mobileNavigationDrawer);
  }, [
    isMobile,
    mobileNavigationDrawer,
    setCurrentMobileNavigationDrawer,
    setIsNavigationDrawerOpen,
  ]);

  return null;
};

type StoryArgs = AppNavigationDrawerProps & {
  mobileNavigationDrawer?: 'main' | 'settings';
  routePath: string;
};

const meta: Meta<StoryArgs> = {
  title: 'Modules/Navigation/AppNavigationDrawer',
  decorators: [
    (Story, { args }) => (
      <MemoryRouter initialEntries={[args.routePath]}>
        <Story />
        <MobileNavigationDrawerStateSetterEffect
          mobileNavigationDrawer={args.mobileNavigationDrawer}
        />
      </MemoryRouter>
    ),
    SnackBarDecorator,
  ],
  component: AppNavigationDrawer,
  args: { routePath: AppPath.Index },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Main: Story = {};

export const Settings: Story = {
  args: {
    mobileNavigationDrawer: 'settings',
    routePath: '/settings/appearance',
  },
};
