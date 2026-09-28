import { type Meta, type StoryObj } from '@storybook/react-vite';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiModelTierDropdown } from '@/ai/components/AiModelTierDropdown';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

const StyledTriggerContainer = styled.div`
  margin-top: 200px;
  margin-left: 200px;
`;

const meta: Meta<typeof AiModelTierDropdown> = {
  title: 'Modules/AiChat/AiModelTierDropdown',
  component: AiModelTierDropdown,
  args: { dropdownId: 'model-tier-story' },
  decorators: [
    (Story, { parameters }) => {
      const store = useStore();
      const setupChat = parameters.setupChat === true;
      useEffect(() => {
        store.set(agentChatUserSelectedModelTierState.atom, null);
        store.set(shouldOpenAiChatAfterOnboardingState.atom, setupChat);
        return () =>
          store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      }, [store, setupChat]);
      return (
        <AiChatSurfaceContext.Provider value="side-panel">
          <StyledTriggerContainer>
            <Story />
          </StyledTriggerContainer>
        </AiChatSurfaceContext.Provider>
      );
    },
    ComponentDecorator,
  ],
  parameters: { container: { height: 300 } },
};
export default meta;
type Story = StoryObj<typeof AiModelTierDropdown>;

export const ChangeTier: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button'));
    const popup = await body.findByRole('dialog', {
      name: 'Choose a model mode',
    });
    await expect(popup.getBoundingClientRect().width).toBe(240);
    await waitFor(() => expect(popup).toHaveAttribute('data-side', 'top'));
    await expect(popup).toHaveAttribute('data-align', 'end');
    const slider = within(popup).getByRole('slider', { name: 'Model' });
    slider.focus();
    await expect(fireEvent.keyDown(slider, { key: 'ArrowRight' })).toBe(true);
    fireEvent.change(slider, { target: { value: '1' } });
    await expect(slider).toHaveValue('1');
    await expect(popup).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};

export const SetupChat: Story = {
  parameters: { setupChat: true },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await expect(trigger).toHaveAccessibleName(/Fast/);
    await userEvent.click(trigger);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('slider'),
    ).toHaveAttribute('aria-valuetext', 'Fast');
  },
};
