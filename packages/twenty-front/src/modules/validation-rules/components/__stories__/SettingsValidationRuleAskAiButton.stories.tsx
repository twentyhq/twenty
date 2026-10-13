import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SettingsValidationRuleAskAiButton } from '@/validation-rules/components/SettingsValidationRuleAskAiButton';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const AskAiButtonStory = ({
  hasAiPermission,
  isInSidePanel,
}: {
  hasAiPermission: boolean;
  isInSidePanel: boolean;
}) => {
  useEffect(() => {
    jotaiStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: hasAiPermission ? [PermissionFlagType.AI] : [],
      objectsPermissions: [],
      isImpersonating: false,
      twoFactorAuthenticationMethodSummary: null,
    });
  }, [hasAiPermission]);

  return (
    <WorkspaceSurfaceContext.Provider
      value={{
        type: isInSidePanel ? 'side-panel' : 'main',
        instanceId: 'ask-ai-button-story',
        ownsRouteLocation: !isInSidePanel,
      }}
    >
      <SettingsValidationRuleAskAiButton />
    </WorkspaceSurfaceContext.Provider>
  );
};

const meta: Meta<typeof AskAiButtonStory> = {
  title: 'Modules/ValidationRules/SettingsValidationRuleAskAiButton',
  component: AskAiButtonStory,
  decorators: [RootDecorator, ComponentDecorator],
  args: { hasAiPermission: true, isInSidePanel: false },
};

export default meta;

type Story = StoryObj<typeof AskAiButtonStory>;

export const WithAiPermission: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Ask AI' }),
    ).toBeVisible();
  },
};

export const WithoutAiPermission: Story = {
  args: { hasAiPermission: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Ask AI' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const InSidePanel: Story = {
  args: { isInSidePanel: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Ask AI' }),
      ).not.toBeInTheDocument(),
    );
  },
};
