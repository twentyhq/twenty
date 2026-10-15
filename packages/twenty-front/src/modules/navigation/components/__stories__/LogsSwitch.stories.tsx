import { LogsSwitch } from '@/navigation/components/LogsSwitch';
import { LOGS_SWITCH_PHRASES } from '@/navigation/constants/LogsSwitchPhrases';
import { i18n } from '@lingui/core';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledSidebarFooter = styled.div`
  width: 204px;
`;

const LogsSwitchWithState = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <StyledSidebarFooter>
      <LogsSwitch isEnabled={isEnabled} onEnabledChange={setIsEnabled} />
    </StyledSidebarFooter>
  );
};

const isLogsSwitchPhrase = (text: string) =>
  LOGS_SWITCH_PHRASES.some((phrase) => i18n._(phrase) === text);

const meta: Meta<typeof LogsSwitch> = {
  title: 'Modules/Navigation/LogsSwitch',
  component: LogsSwitch,
  decorators: [ComponentDecorator],
  render: () => <LogsSwitchWithState />,
};

export default meta;

type Story = StoryObj<typeof LogsSwitch>;

export const TypesAPhraseWhenTurnedOn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('switch', { name: 'Logs' }));

    expect(
      await canvas.findByText(isLogsSwitchPhrase, {}, { timeout: 3000 }),
    ).toBeVisible();

    await waitFor(() => expect(canvas.getByText('Logs')).toBeVisible(), {
      timeout: 6000,
    });
  },
};

export const ShowsTheLabelWhenTurnedOffMidAnimation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const logsSwitchSwitch = canvas.getByRole('switch', {
      name: 'Logs',
    });

    await userEvent.click(logsSwitchSwitch);
    await canvas.findByText(isLogsSwitchPhrase, {}, { timeout: 3000 });
    await userEvent.click(logsSwitchSwitch);

    expect(logsSwitchSwitch).not.toBeChecked();
    expect(canvas.queryByText(isLogsSwitchPhrase)).not.toBeInTheDocument();
    expect(canvas.getByText('Logs')).toBeVisible();
  },
};
