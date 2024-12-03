import { BottomBar } from '@/ui/layout/bottom-bar/components/BottomBar';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import { Button, IconPlus } from 'twenty-ui';

const StyledContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const meta: Meta<typeof BottomBar> = {
  title: 'UI/Layout/BottomBar/BottomBar',
  component: BottomBar,
  args: {
    bottomBarId: 'test',
    bottomBarHotkeyScopeFromParent: { scope: 'test' },
    children: (
      <StyledContainer>
        <Button title="Test 1" Icon={IconPlus} />
        <Button title="Test 2" Icon={IconPlus} />
        <Button title="Test 3" Icon={IconPlus} />
      </StyledContainer>
    ),
  },
  argTypes: {
    bottomBarId: { control: false },
    bottomBarHotkeyScopeFromParent: { control: false },
    children: { control: false },
  },
};

export default meta;

export const Default: StoryObj<typeof BottomBar> = {
  decorators: [
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            isBottomBarOpenedComponentState.atomFamily({
              instanceId: 'test',
            }),
            true,
          );
        }}
      >
        <Story />
      </RecoilRoot>
    ),
  ],
};

export const Closed: StoryObj<typeof BottomBar> = {
  decorators: [
    (Story) => (
      <RecoilRoot>
        <Story />
      </RecoilRoot>
    ),
  ],
};
