import { DeveloperModeSwitch } from '@/navigation/components/DeveloperModeSwitch';
import { DEVELOPER_MODE_PHRASES } from '@/navigation/constants/DeveloperModePhrases';
import { i18n } from '@lingui/core';
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

const isDeveloperModePhrase = (text: string) =>
  DEVELOPER_MODE_PHRASES.some((phrase) => i18n._(phrase) === text);

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

    expect(
      await canvas.findByText(isDeveloperModePhrase, {}, { timeout: 3000 }),
    ).toBeVisible();

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
    await canvas.findByText(isDeveloperModePhrase, {}, { timeout: 3000 });
    await userEvent.click(developerModeSwitch);

    expect(developerModeSwitch).not.toBeChecked();
    expect(canvas.queryByText(isDeveloperModePhrase)).not.toBeInTheDocument();
    expect(canvas.getByText('Developer mode')).toBeVisible();
  },
};
