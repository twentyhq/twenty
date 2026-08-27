import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconChartBar } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledContainer = styled.div`
  display: flex;
  width: 280px;
`;

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
    avatar: { placeholder: 'Acme', type: 'rounded' },
    title: 'Acme',
    label: 'Created 2 days ago',
  },
};

export const RecordPage: Story = {
  args: {
    ...Record.args,
    fontSize: 'lg',
  },
};

export const Chart: Story = {
  args: {
    icon: <IconChartBar size={16} />,
    title: 'Revenue forecast',
    label: 'Chart',
  },
};

export const LongTitle: Story = {
  args: {
    ...Chart.args,
    title: 'Rocket Count (Object Permission Test)',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Update records',
  },
};
