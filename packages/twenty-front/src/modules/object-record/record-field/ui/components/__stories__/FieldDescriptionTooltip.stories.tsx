import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';
import { FieldDescriptionTooltipProvider } from '@/object-record/record-field/ui/components/FieldDescriptionTooltipProvider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof FieldDescriptionTooltip> = {
  title: 'UI/Data/Field/FieldDescriptionTooltip',
  component: FieldDescriptionTooltip,
  decorators: [ComponentDecorator],
  args: {
    label: 'Domain Name',
    description: 'The company website URL',
  },
  render: (args) => (
    <FieldDescriptionTooltipProvider>
      <FieldDescriptionTooltip {...args} />
      <FieldDescriptionTooltip
        label="Account Owner"
        description="The team member responsible for this company"
      />
    </FieldDescriptionTooltipProvider>
  ),
};

export default meta;
type Story = StoryObj<typeof FieldDescriptionTooltip>;

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const firstLabel = canvas.getByText('Domain Name');
    const secondLabel = canvas.getByText('Account Owner');

    await userEvent.hover(firstLabel);
    expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
    const tooltip = await body.findByRole('tooltip', undefined, {
      timeout: 5000,
    });
    await waitFor(() => expect(tooltip).toBeVisible());
    expect(tooltip).toHaveTextContent('The company website URL');

    await userEvent.unhover(firstLabel);
    await userEvent.hover(secondLabel);
    await waitFor(() =>
      expect(tooltip).toHaveTextContent(
        'The team member responsible for this company',
      ),
    );
    expect(body.getAllByRole('tooltip')).toHaveLength(1);
    expect(tooltip).not.toHaveTextContent('The company website URL');
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const firstLabel = canvas.getByText('Domain Name');
    const secondLabel = canvas.getByText('Account Owner');

    await userEvent.tab();
    expect(firstLabel).toHaveFocus();
    expect(firstLabel).toHaveAccessibleDescription('The company website URL');
    await userEvent.hover(firstLabel);
    await userEvent.unhover(firstLabel);
    const tooltip = await body.findByRole('tooltip', undefined, {
      timeout: 5000,
    });
    await waitFor(() => expect(tooltip).toBeVisible());

    await userEvent.hover(firstLabel);
    await userEvent.unhover(firstLabel);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(tooltip).toBeVisible();
    expect(firstLabel).toHaveFocus();

    await userEvent.tab();
    expect(secondLabel).toHaveFocus();
    await waitFor(() =>
      expect(tooltip).toHaveTextContent(
        'The team member responsible for this company',
      ),
    );

    await userEvent.tab();
    await waitFor(() => expect(body.queryByRole('tooltip')).toBeNull());
  },
};

export const WithoutDescription: Story = {
  args: { description: '' },
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText('Domain Name');

    expect(label).not.toHaveAttribute('tabindex');
    expect(label).not.toHaveAttribute('data-tooltip-id');
    expect(label).not.toHaveAttribute('aria-describedby');
    await userEvent.tab();
    expect(within(canvasElement).getByText('Account Owner')).toHaveFocus();
  },
};

export const SeparateSurfaces: Story = {
  render: () => (
    <>
      <FieldDescriptionTooltipProvider>
        <FieldDescriptionTooltip label="Company" description="Company name" />
      </FieldDescriptionTooltipProvider>
      <FieldDescriptionTooltipProvider>
        <FieldDescriptionTooltip label="Person" description="Person name" />
      </FieldDescriptionTooltipProvider>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const companyLabel = canvas.getByText('Company');
    const personLabel = canvas.getByText('Person');

    await userEvent.hover(companyLabel);
    await waitFor(
      () => expect(body.getByRole('tooltip')).toHaveTextContent('Company name'),
      { timeout: 5000 },
    );

    await userEvent.unhover(companyLabel);
    await userEvent.hover(personLabel);
    await waitFor(
      () => expect(body.getByRole('tooltip')).toHaveTextContent('Person name'),
      { timeout: 5000 },
    );
    expect(body.getAllByRole('tooltip')).toHaveLength(1);
    expect(body.getByRole('tooltip')).not.toHaveTextContent('Company name');
  },
};
