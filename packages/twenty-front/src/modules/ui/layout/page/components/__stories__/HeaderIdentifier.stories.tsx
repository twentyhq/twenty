import { TitleInput } from '@/ui/input/components/TitleInput';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconChartBar } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledContainer = styled.div`
  display: flex;
  width: 280px;
`;

const onIconClick = fn();
const onTitleChange = fn();
const onTitleEnter = fn();

const meta: Meta<typeof HeaderIdentifier> = {
  title: 'UI/Layout/Page/HeaderIdentifier',
  component: HeaderIdentifier,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HeaderIdentifier>;

export const Record: Story = {
  args: {
    avatar: { placeholder: 'Acme', type: 'rounded', onClick: fn() },
    title: 'Acme',
    label: 'Created 2 days ago',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('heading', { name: 'Acme', level: 3 }),
    ).toBeVisible();
    expect(canvas.getByText('Created 2 days ago')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Acme' }));

    expect(args.avatar?.onClick).toHaveBeenCalledTimes(1);
  },
};

export const RecordPage: Story = {
  args: {
    ...Record.args,
    fontSize: 'lg',
  },
  play: Record.play,
};

export const Chart: Story = {
  args: {
    icon: <IconChartBar size={16} />,
    title: 'Revenue forecast',
    label: 'Chart',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('heading', {
        name: 'Revenue forecast',
        level: 3,
      }),
    ).toBeVisible();
    expect(canvas.getByText('Chart')).toBeVisible();
  },
};

export const LongTitle: Story = {
  args: {
    ...Chart.args,
    title: 'Rocket Count (Object Permission Test)',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('heading', {
        name: 'Rocket Count (Object Permission Test)',
        level: 3,
      }),
    ).toBeVisible();
    expect(canvas.getByText('Chart')).toBeVisible();
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Update records',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('heading', { name: 'Update records', level: 3 }),
    ).toBeVisible();
    expect(canvas.queryByText('Chart')).not.toBeInTheDocument();
  },
};

export const InteractiveIcon: Story = {
  args: {
    ...Chart.args,
    icon: (
      <button aria-label="Change chart icon" onClick={onIconClick}>
        <IconChartBar size={16} />
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Change chart icon' }),
    );

    expect(onIconClick).toHaveBeenCalledTimes(1);
  },
};

export const EditableTitle: Story = {
  args: { label: 'Chart' },
  render: (args) => (
    <HeaderIdentifier
      {...args}
      title={
        <TitleInput
          instanceId="header-identifier-title"
          sizeVariant="sm"
          value="Revenue forecast"
          onChange={onTitleChange}
          onEnter={onTitleEnter}
        />
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('Revenue forecast'));
    const titleInput = await canvas.findByRole('textbox');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated forecast{Enter}');

    expect(onTitleChange).toHaveBeenLastCalledWith('Updated forecast');
    expect(onTitleEnter).toHaveBeenCalledTimes(1);
    expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

export const LinkedTitle: Story = {
  args: { title: <a href="/record/acme">Acme</a> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('link', { name: 'Acme' })).toHaveAttribute(
      'href',
      '/record/acme',
    );
  },
};
