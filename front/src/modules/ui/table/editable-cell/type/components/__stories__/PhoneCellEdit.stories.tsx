import type { Meta, StoryObj } from '@storybook/react';

import { PhoneCellEdit } from '@/ui/table/editable-cell/type/components/PhoneCellEdit';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';

const meta: Meta<typeof PhoneCellEdit> = {
  title: 'UI/Table/EditableCell/PhoneCellEdit',
  component: PhoneCellEdit,
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
type Story = StoryObj<typeof PhoneCellEdit>;

export const Default: Story = {};
