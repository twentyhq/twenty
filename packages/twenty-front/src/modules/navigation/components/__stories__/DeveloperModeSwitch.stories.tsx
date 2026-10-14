import { DeveloperModeSwitch } from '@/navigation/components/DeveloperModeSwitch';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledSidebarFooter = styled.div`
  width: 204px;
`;

const DeveloperModeSwitchWithState = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <StyledSidebarFooter>
      <DeveloperModeSwitch
        isEnabled={isEnabled}
        onEnabledChange={setIsEnabled}
      />
    </StyledSidebarFooter>
  );
};

const meta: Meta<typeof DeveloperModeSwitch> = {
  title: 'Modules/Navigation/DeveloperModeSwitch',
  component: DeveloperModeSwitch,
  decorators: [ComponentDecorator],
  render: () => <DeveloperModeSwitchWithState />,
};

export default meta;

type Story = StoryObj<typeof DeveloperModeSwitch>;

export const TypesAPhraseWhenTurnedOn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('switch', { name: 'Developer mode' }),
    );

    await waitFor(
      () =>
        expect(canvas.queryByText('Developer mode')).not.toBeInTheDocument(),
      { timeout: 2000 },
    );

    await waitFor(
      () => expect(canvas.getByText('Developer mode')).toBeVisible(),
      { timeout: 6000 },
    );
  },
};

export const ShowsTheLabelWhenTurnedOffMidAnimation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const developerModeSwitch = canvas.getByRole('switch', {
      name: 'Developer mode',
    });

    await userEvent.click(developerModeSwitch);
    await waitFor(
      () =>
        expect(canvas.queryByText('Developer mode')).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
    await userEvent.click(developerModeSwitch);

    expect(developerModeSwitch).not.toBeChecked();
    expect(canvas.getByText('Developer mode')).toBeVisible();
  },
};
