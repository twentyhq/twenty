import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TableRecoilScopeContext } from '../../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { TableOptionsDropdown } from '../TableOptionsDropdown';

const meta: Meta<typeof TableOptionsDropdown> = {
  title: 'UI/Table/Options/TableOptionsDropdown',
  component: TableOptionsDropdown,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={TableRecoilScopeContext}>
        <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
          <Story />
        </RecoilScope>
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof TableOptionsDropdown>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = canvas.getByText('Options');

    await userEvent.click(dropdownButton);
  },
};
