import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type FormEvent } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Chip } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { IconBuildingSkyscraper, IconUser } from 'twenty-ui/icon';
import { AVATAR_URL_MOCK, ComponentDecorator } from 'twenty-ui/testing';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';

const meta: Meta<typeof AvatarOrIcon> = {
  title: 'UI/Data Display/AvatarOrIcon',
  component: AvatarOrIcon,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof AvatarOrIcon>;

export const Default: Story = {
  args: {
    name: 'JD',
    colorSeed: 'John Doe',
  },
};

export const WithAvatar: Story = {
  args: {
    src: AVATAR_URL_MOCK,
    name: 'JD',
    colorSeed: 'John Doe',
  },
};

export const WithIcon: Story = {
  args: {
    Icon: IconUser,
  },
};

export const WithIconBackground: Story = {
  args: {
    Icon: IconBuildingSkyscraper,
    isIconInverted: true,
  },
};

export const WithInvertedIcon: Story = {
  args: {
    Icon: IconUser,
    isIconInverted: true,
  },
};

const onContainerClick = fn();
const onContainerKeyDown = fn();
const onFormSubmit = fn((event: FormEvent) => event.preventDefault());

const clickableStory: Story = {
  beforeEach: () => {
    onContainerClick.mockClear();
    onContainerKeyDown.mockClear();
    onFormSubmit.mockClear();
  },
  render: (args) => (
    <>
      <Button>Before avatar</Button>
      <form
        onClick={onContainerClick}
        onKeyDown={onContainerKeyDown}
        onSubmit={onFormSubmit}
      >
        <AvatarOrIcon {...args} />
      </form>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const button = canvas.getByRole('button', { name: args.name ?? 'Avatar' });

    await user.click(canvas.getByRole('button', { name: 'Before avatar' }));
    await user.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('type', 'button');
    expect(getComputedStyle(button).outlineStyle).toBe('solid');
    expect(button.getBoundingClientRect().width).toBe(14);
    expect(button.getBoundingClientRect().height).toBe(14);

    await user.keyboard('{Enter}');
    expect(args.onClick).toHaveBeenCalledTimes(1);
    await user.keyboard('[Space>]');
    expect(args.onClick).toHaveBeenCalledTimes(1);
    await user.keyboard('[/Space]');
    expect(args.onClick).toHaveBeenCalledTimes(2);
    expect(onContainerKeyDown).toHaveBeenCalledTimes(2);
    await user.click(button);
    expect(args.onClick).toHaveBeenCalledTimes(3);
    expect(onContainerClick).toHaveBeenCalledTimes(3);
    expect(button).toHaveFocus();
    expect(onFormSubmit).not.toHaveBeenCalled();
  },
};

export const Clickable: Story = {
  ...clickableStory,
  args: {
    name: 'JD',
    colorSeed: 'John Doe',
    onClick: fn(),
  },
};

export const ClickableIcon: Story = {
  ...clickableStory,
  args: {
    Icon: IconBuildingSkyscraper,
    isIconInverted: true,
    name: 'Company',
    onClick: fn(),
  },
};

export const ClickablePlainIcon: Story = {
  ...clickableStory,
  args: {
    Icon: IconUser,
    onClick: fn(),
  },
};

export const FileActionPropagation: Story = {
  args: {
    Icon: IconUser,
    name: 'Remove file',
    onClick: fn(),
  },
  beforeEach: () => onContainerClick.mockClear(),
  render: (args) => (
    <div onClick={onContainerClick}>
      <Chip
        endElement={
          <span onClick={(event) => event.stopPropagation()}>
            <AvatarOrIcon {...args} />
          </span>
        }
      >
        File preview
      </Chip>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const removeButton = canvas.getByRole('button', { name: 'Remove file' });

    expect(canvas.getAllByRole('button')).toHaveLength(1);
    await user.click(removeButton);
    await user.keyboard('{Enter} ');
    expect(args.onClick).toHaveBeenCalledTimes(3);
    expect(onContainerClick).not.toHaveBeenCalled();
  },
};

export const DisabledFieldset: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <>
      <Button>Before disabled avatars</Button>
      <fieldset disabled>
        <legend>Unavailable avatars</legend>
        <AvatarOrIcon {...args} name="Person" />
        <AvatarOrIcon {...args} name="Company" Icon={IconBuildingSkyscraper} />
      </fieldset>
      <Button>After disabled avatars</Button>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    await user.click(
      canvas.getByRole('button', { name: 'Before disabled avatars' }),
    );
    await user.tab();
    expect(
      canvas.getByRole('button', { name: 'After disabled avatars' }),
    ).toHaveFocus();
    for (const name of ['Person', 'Company']) {
      const button = canvas.getByRole('button', { name });
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const DecorativeIconInButton: Story = {
  render: () => (
    <Button startIcon={<AvatarOrIcon Icon={IconUser} />}>Open person</Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    expect(canvas.getAllByRole('button')).toHaveLength(1);
    await user.tab();
    expect(canvas.getByRole('button', { name: 'Open person' })).toHaveFocus();
  },
};
