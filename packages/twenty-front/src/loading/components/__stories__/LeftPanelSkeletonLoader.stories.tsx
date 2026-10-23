import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { LeftPanelSkeletonLoader } from '~/loading/components/LeftPanelSkeletonLoader';

const meta: Meta<typeof LeftPanelSkeletonLoader> = {
  title: 'App/Loading/LeftPanelSkeletonLoader',
  component: LeftPanelSkeletonLoader,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof LeftPanelSkeletonLoader>;

export const Default: Story = {
  render: () => (
    <nav
      aria-label="Loading navigation"
      style={{ height: '100vh', width: NAVIGATION_DRAWER_CONSTRAINTS.default }}
    >
      <LeftPanelSkeletonLoader />
    </nav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole('navigation', {
      name: 'Loading navigation',
    });
    const navigationBounds = navigation.getBoundingClientRect();
    const skeletons = navigation.querySelectorAll('[data-skeleton]');

    expect(skeletons.length).toBeGreaterThan(0);

    for (const skeleton of skeletons) {
      const skeletonBounds = skeleton.getBoundingClientRect();
      const leftInset = skeletonBounds.left - navigationBounds.left;
      const rightInset = navigationBounds.right - skeletonBounds.right;

      expect(leftInset).toBeGreaterThan(0);
      expect(rightInset).toBeGreaterThanOrEqual(leftInset);
    }
  },
};
