import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { Text } from 'twenty-ui/primitives/typography';

import { SettingsSectionAnchor } from '@/settings/components/SettingsSectionAnchor';

const meta: Meta<typeof SettingsSectionAnchor> = {
  title: 'Modules/Settings/SettingsSectionAnchor',
  component: SettingsSectionAnchor,
  decorators: [ComponentDecorator],
  args: {
    sectionId: 'connections',
    children: <Text>Connections section</Text>,
  },
};
export default meta;
type Story = StoryObj<typeof SettingsSectionAnchor>;

export const Targeted: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/settings/app#general/connections']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  play: async ({ canvasElement }) => {
    const section = await within(canvasElement).findByText(
      'Connections section',
    );

    await expect(section.parentElement).toHaveAttribute(
      'data-targeted',
      'true',
    );
  },
};

export const NotTargeted: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/settings/app#general']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  play: async ({ canvasElement }) => {
    const section = await within(canvasElement).findByText(
      'Connections section',
    );

    await expect(section.parentElement).toHaveAttribute(
      'data-targeted',
      'false',
    );
  },
};
