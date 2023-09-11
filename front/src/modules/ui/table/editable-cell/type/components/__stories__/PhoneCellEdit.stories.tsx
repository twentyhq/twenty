import type { Meta, StoryObj } from '@storybook/react';

import { PhoneInput } from '@/ui/input/components/PhoneInput';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';

const meta: Meta<typeof PhoneInput> = {
  title: 'UI/Table/EditableCell/PhoneCellEdit',
  component: PhoneInput,
  decorators: [ComponentWithRecoilScopeDecorator],
  args: {
    value: '+33714446494',
    autoFocus: true,
  },
  parameters: {
    recoilScopeContext: TableRecoilScopeContext,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneInput>;

export const Default: Story = {};
