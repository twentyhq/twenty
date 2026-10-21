import { type Meta, type StoryObj } from '@storybook/react-vite';

import { AiChatQuotaLimitExhaustedMessage } from '@/ai/components/AiChatQuotaLimitExhaustedMessage';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';

const meta: Meta<typeof AiChatQuotaLimitExhaustedMessage> = {
  title: 'Modules/AI/AiChatQuotaLimitExhaustedMessage',
  component: AiChatQuotaLimitExhaustedMessage,
  decorators: [PermissionFlagsDecorator, ComponentWithRouterDecorator],
  args: {
    error: new Error('You have reached your AI usage limit for this period.'),
  },
};

export default meta;
type Story = StoryObj<typeof AiChatQuotaLimitExhaustedMessage>;

export const WithWorkspacePermission: Story = {
  parameters: { permissionFlags: [PermissionFlagType.WORKSPACE] },
};

export const WithoutWorkspacePermission: Story = {
  parameters: { permissionFlags: [] },
};
