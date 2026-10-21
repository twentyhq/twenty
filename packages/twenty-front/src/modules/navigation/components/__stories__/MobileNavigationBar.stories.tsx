import { MobileNavigationBar } from '@/navigation/components/MobileNavigationBar';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const StyledFrame = styled.div`
  height: 240px;
  position: relative;
  width: 320px;
`;

const VisibilityControl = () => {
  const [isSidePanelOpened, setIsSidePanelOpened] = useAtomState(
    isSidePanelOpenedState,
  );

  return (
    <Button onClick={() => setIsSidePanelOpened(!isSidePanelOpened)}>
      {isSidePanelOpened ? 'Close side panel' : 'Open side panel'}
    </Button>
  );
};

type StoryArgs = { routePath: string };

const meta: Meta<StoryArgs> = {
  title: 'UI/Navigation/NavigationBar/NavigationBar',
  component: MobileNavigationBar,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    (Story, { args }) => (
      <MemoryRouter initialEntries={[args.routePath]}>
        <StyledFrame>
          <Story />
        </StyledFrame>
      </MemoryRouter>
    ),
  ],
  args: { routePath: '/home' },
  render: () => <MobileNavigationBar />,
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('navigation')).toBeVisible();

    const home = canvas.getByRole('button', { name: 'Home' });
    const search = canvas.getByRole('button', { name: 'Search' });

    await expect(home).toHaveAttribute('aria-current', 'page');
    await expect(home).not.toHaveAttribute('aria-pressed');
    await expect(search).not.toHaveAttribute('aria-current');

    await userEvent.tab();
    await expect(home).toHaveFocus();
    await expect(getComputedStyle(home).outlineStyle).toBe('solid');
    await userEvent.tab();
    await expect(search).toHaveFocus();
    await expect(home).toHaveAttribute('aria-current', 'page');
  },
};

export const Hidden: Story = {
  args: { routePath: '/chat/20202020-0687-4c41-b707-ed1bfca972a7' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = await canvas.findByRole('navigation', { hidden: true });

    await expect(navigation).not.toBeVisible();
    await expect(navigation).toHaveAttribute('aria-hidden', 'true');

    const home = canvas.getByLabelText('Home');
    home.focus();
    await expect(home).not.toHaveFocus();
  },
};

export const HideAndReveal: Story = {
  render: () => (
    <>
      <VisibilityControl />
      <MobileNavigationBar />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = await canvas.findByRole('button', { name: 'Home' });
    await expect(home).toHaveAttribute('aria-current', 'page');
    home.focus();
    await expect(home).toHaveFocus();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open side panel' }),
    );
    home.focus();
    await expect(home).not.toHaveFocus();
    await expect(canvas.queryByRole('navigation')).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Close side panel' }),
    );
    await waitFor(() => expect(canvas.getByRole('navigation')).toBeVisible());
    home.focus();
    await expect(home).toHaveFocus();
  },
};
