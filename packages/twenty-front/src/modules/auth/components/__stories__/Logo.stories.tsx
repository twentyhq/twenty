import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { Logo } from '../Logo';

const logoUrl = 'https://picsum.photos/192/192';

const meta: Meta<typeof Logo> = {
  title: 'Modules/Auth/Logo',
  component: Logo,
  decorators: [
    (Story) => (
      <div style={{ padding: '24px' }}>
        <RecoilRoot>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </RecoilRoot>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const WithSecondaryLogo: Story = {
  args: {
    primaryLogo: null,
    secondaryLogo: logoUrl,
    placeholder: 'A',
  },
};

export const WithPlaceholder: Story = {
  args: {
    primaryLogo: null,
    secondaryLogo: null,
    placeholder: 'B',
  },
};

export const WithPrimaryAndSecondaryLogo: Story = {
  args: {
    primaryLogo: logoUrl,
    secondaryLogo: logoUrl,
    placeholder: 'C',
  },
};

export const WithPrimaryLogoAndPlaceholder: Story = {
  args: {
    primaryLogo: logoUrl,
    secondaryLogo: null,
    placeholder: 'D',
  },
};
