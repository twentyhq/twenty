import { type Meta, type StoryObj } from '@storybook/react-vite';

import { AiChatUsageLimitReachedBanner } from '@/ai/components/AiChatUsageLimitReachedBanner';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';

const meta: Meta<typeof AiChatUsageLimitReachedBanner> = {
  title: 'Modules/AI/AiChatUsageLimitReachedBanner',
  component: AiChatUsageLimitReachedBanner,
  decorators: [PermissionFlagsDecorator, ComponentWithRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof AiChatUsageLimitReachedBanner>;

export const WithBillingPermission: Story = {
  parameters: { permissionFlags: [PermissionFlagType.BILLING] },
};

export const WithoutBillingPermission: Story = {
  parameters: { permissionFlags: [] },
};
