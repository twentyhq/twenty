import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TableRecoilScopeContext } from '../../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { TableOptionsDropdown } from '../TableOptionsDropdown';

const meta: Meta<typeof TableOptionsDropdown> = {
  title: 'UI/Table/Options/TableOptionsDropdown',
  component: TableOptionsDropdown,
  decorators: [
    (Story) => (
      <RecoilScope CustomRecoilScopeContext={TableRecoilScopeContext}>
        <ViewBarContext.Provider
          value={{
            ViewBarRecoilScopeContext: TableRecoilScopeContext,
          }}
        >
          <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
            <Story />
          </RecoilScope>
        </ViewBarContext.Provider>
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof TableOptionsDropdown>;

export const Default: Story = {
  args: {
    customHotkeyScope: { scope: 'options' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = canvas.getByText('Options');

    await userEvent.click(dropdownButton);
  },
};
