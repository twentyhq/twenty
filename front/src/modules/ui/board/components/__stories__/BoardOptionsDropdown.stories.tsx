import { type Meta, type StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { BoardContext } from '@/companies/states/contexts/BoardContext';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';

import { BoardOptionsDropdown } from '../BoardOptionsDropdown';

const meta: Meta<typeof BoardOptionsDropdown> = {
  title: 'UI/Board/Options/BoardOptionsDropdown',
  component: BoardOptionsDropdown,
  decorators: [
    (Story, { parameters }) => (
      <BoardContext.Provider
        value={{
          BoardRecoilScopeContext: parameters.customRecoilScopeContext,
        }}
      >
        <ViewBarContext.Provider
          value={{
            ViewBarRecoilScopeContext: parameters.customRecoilScopeContext,
          }}
        >
          <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
            <Story />
          </RecoilScope>
        </ViewBarContext.Provider>
      </BoardContext.Provider>
    ),
    ComponentWithRecoilScopeDecorator,
    ComponentDecorator,
  ],
  parameters: {
    customRecoilScopeContext: CompanyBoardRecoilScopeContext,
  },
  args: {
    customHotkeyScope: { scope: 'scope' },
  },
};

export default meta;
type Story = StoryObj<typeof BoardOptionsDropdown>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = canvas.getByText('Options');

    await userEvent.click(dropdownButton);
  },
};
