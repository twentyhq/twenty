import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
  hostApiMocks,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HostApi/UserApplicationVariables',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

const personalSettingsStory = runFrontComponentStory({
  frontComponentBundleName: 'host-api-user-application-variables',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('dark', {}, { timeout: INTERACTION_TIMEOUT }),
    ).toBeVisible();
    expect(await canvas.findByText('Account: account-one')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Save theme' }));
    expect(
      await canvas.findByText(
        'Saved theme: light',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});

type PersonalSettingsHostProps = Pick<
  ComponentProps<typeof FrontComponentRenderer>,
  | 'componentUrl'
  | 'applicationAccessToken'
  | 'executionContext'
  | 'onError'
  | 'colorScheme'
>;

const PersonalSettingsHost = (props: PersonalSettingsHostProps) => {
  const [hasAccess, setHasAccess] = useState(true);
  const [variables] = useState<Record<string, string>>({ THEME: 'dark' });

  return (
    <>
      <button type="button" onClick={() => setHasAccess(false)}>
        Remove personal settings access
      </button>
      <FrontComponentRenderer
        componentUrl={props.componentUrl}
        applicationAccessToken={props.applicationAccessToken}
        executionContext={props.executionContext}
        onError={props.onError}
        colorScheme={props.colorScheme}
        frontComponentHostCommunicationApi={{
          ...hostApiMocks,
          ...(hasAccess
            ? {
                getUserApplicationVariables: async () => ({ ...variables }),
                updateUserApplicationVariable: async ({ key, value }) => {
                  variables[key] = value;
                },
              }
            : {}),
        }}
      />
    </>
  );
};

export const ReadAndSave: Story = {
  ...personalSettingsStory,
  args: {
    ...personalSettingsStory.args,
    executionContext: {
      ...FRONT_COMPONENT_STORY_DEFAULT_EXECUTION_CONTEXT,
      connectedAccountId: 'account-one',
    },
  },
  render: (args) => (
    <PersonalSettingsHost
      componentUrl={args.componentUrl}
      applicationAccessToken={args.applicationAccessToken}
      executionContext={args.executionContext}
      onError={args.onError}
      colorScheme={args.colorScheme}
    />
  ),
};

export const AccessRemoved: Story = {
  ...ReadAndSave,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('dark', {}, { timeout: INTERACTION_TIMEOUT });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove personal settings access' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Save theme' }));
    expect(
      await canvas.findByText(
        'User application variables are only available in personal app settings',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
};

export const OutsidePersonalSettings: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-user-application-variables',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'User application variables are only available in personal app settings',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Save theme' }));
    expect(canvas.getByText('Account: none')).toBeVisible();
  },
});
