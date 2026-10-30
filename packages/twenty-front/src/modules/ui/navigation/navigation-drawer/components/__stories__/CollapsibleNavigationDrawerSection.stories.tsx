import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const SECTION_ID = 'stories/settings/User';

const SidebarControls = () => {
  const [isExpanded, setIsExpanded] = useAtomState(
    isNavigationDrawerExpandedState,
  );

  return (
    <button onClick={() => setIsExpanded(!isExpanded)}>
      {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
    </button>
  );
};

const SectionWithSidebarControls = () => {
  const [store] = useState(() => {
    const initialStore = createStore();
    initialStore.set(isNavigationDrawerExpandedState.atom, true);
    initialStore.set(
      isNavigationSectionOpenFamilyState.atomFamily(SECTION_ID),
      true,
    );
    return initialStore;
  });

  return (
    <Provider store={store}>
      <SidebarControls />
      <CollapsibleNavigationDrawerSection sectionId={SECTION_ID} label="User">
        <a href="/settings/profile">Profile</a>
      </CollapsibleNavigationDrawerSection>
    </Provider>
  );
};

const meta: Meta<typeof CollapsibleNavigationDrawerSection> = {
  title: 'UI/Navigation/NavigationDrawer/CollapsibleNavigationDrawerSection',
  component: CollapsibleNavigationDrawerSection,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  render: () => <SectionWithSidebarControls />,
};

export default meta;
type Story = StoryObj<typeof CollapsibleNavigationDrawerSection>;

export const PreservesSectionState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('User'));
    await waitFor(() =>
      expect(
        canvas.queryByRole('link', { name: 'Profile' }),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Collapse sidebar' }),
    );
    await expect(
      await canvas.findByRole('link', { name: 'Profile' }),
    ).toBeVisible();
    await expect(canvas.queryByText('User')).not.toBeInTheDocument();

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Expand sidebar' }),
    );
    await expect(await canvas.findByText('User')).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.queryByRole('link', { name: 'Profile' }),
      ).not.toBeInTheDocument(),
    );
  },
};
