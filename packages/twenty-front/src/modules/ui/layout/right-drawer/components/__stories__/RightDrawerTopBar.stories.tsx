import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';

import { RightDrawerTopBar } from '../RightDrawerTopBar';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { useSetRecoilState } from 'recoil';
import { rightDrawerPageState } from '@/ui/layout/right-drawer/states/rightDrawerPageState';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { useEffect } from 'react';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { within } from '@storybook/test';

const RightDrawerTopBarStateSetterEffect = () => {
  const setRightDrawerPage = useSetRecoilState(rightDrawerPageState);

  const setIsRightDrawerMinimizedState = useSetRecoilState(
    isRightDrawerMinimizedState,
  );

  useEffect(() => {
    setRightDrawerPage(RightDrawerPages.ViewRecord);
    setIsRightDrawerMinimizedState(false);
  }, [setIsRightDrawerMinimizedState, setRightDrawerPage]);
  return null;
};

const meta: Meta<typeof RightDrawerTopBar> = {
  title: 'Modules/Activities/RightDrawer/RightDrawerTopBar',
  component: RightDrawerTopBar,
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
        <RightDrawerTopBarStateSetterEffect />
      </div>
    ),
    IconsProviderDecorator,
    ComponentWithRouterDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof RightDrawerTopBar>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Company')).toBeInTheDocument();
  },
};
