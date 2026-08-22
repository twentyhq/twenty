import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormLinksFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormLinksFieldInput',
  component: FormLinksFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator],
};

export default meta;

type Story = StoryObj<typeof FormLinksFieldInput>;

export const Default: Story = {
  args: {
    label: 'Domain Name',
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Domain Name');
    await canvas.findByText('Primary Link Label');
    await canvas.findByText('Google');
  },
};

export const WithVariables: Story = {
  args: {
    label: 'Domain Name',
    defaultValue: {
      primaryLinkLabel: '{{04d5f3bf-9714-400d-ba27-644006a5fb1b.name}}',
      primaryLinkUrl: '{{04d5f3bf-9714-400d-ba27-644006a5fb1b.stage}}',
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryLinkLabelVariable = await canvas.findByText('Name');
    expect(primaryLinkLabelVariable).toBeVisible();

    const primaryLinkUrlVariable = await canvas.findByText('Stage');
    expect(primaryLinkUrlVariable).toBeVisible();

    // primary label, primary url, and the secondary links list
    const variablePickers = await canvas.findAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(3);

    for (const variablePicker of variablePickers) {
      expect(variablePicker).toBeVisible();
    }
  },
};

export const PreservesSecondaryLinksWhenEditingPrimary: Story = {
  args: {
    label: 'Intro Video',
    onChange: fn(),
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
      secondaryLinks: [
        { label: 'Documentation', url: 'https://docs.twenty.com' },
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const labelInput = await canvas.findByText('Google');

    await userEvent.type(labelInput, 'X');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          secondaryLinks: [
            { label: 'Documentation', url: 'https://docs.twenty.com' },
          ],
        }),
      );
    });
  },
};

export const AddsASecondaryLink: Story = {
  args: {
    label: 'Intro Video',
    onChange: fn(),
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
      secondaryLinks: [],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const secondaryLinkInput =
      await canvas.findByPlaceholderText('Enter an item');

    await userEvent.type(secondaryLinkInput, 'https://docs.twenty.com{enter}');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          secondaryLinks: [{ label: null, url: 'https://docs.twenty.com' }],
        }),
      );
    });
  },
};

export const BindsSecondaryLinksToAVariable: Story = {
  args: {
    label: 'Intro Video',
    onChange: fn(),
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
      secondaryLinks: `{{${MOCKED_STEP_ID}.name}}`,
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // the bound variable renders as a chip instead of the list input
    expect(await canvas.findByText('Name')).toBeVisible();
    expect(
      canvas.queryByPlaceholderText('Enter an item'),
    ).not.toBeInTheDocument();
  },
};

export const StopsAddingSecondaryLinksAtTheFieldLimit: Story = {
  args: {
    label: 'Intro Video',
    onChange: fn(),
    // two allowed values: the primary link plus one secondary
    maxNumberOfValues: 2,
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
      secondaryLinks: [{ label: null, url: 'https://docs.twenty.com' }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('https://docs.twenty.com'));

    await waitFor(() => {
      expect(canvas.queryByText('Add item')).not.toBeInTheDocument();
    });
  },
};

export const HidesSecondaryLinksWhenSingleValueField: Story = {
  args: {
    label: 'Domain Name',
    maxNumberOfValues: 1,
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Primary Link Label');

    expect(canvas.queryByText('Secondary Links')).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Domain Name',
    readonly: true,
    onChange: fn(),
    VariablePicker: () => <div>VariablePicker</div>,
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const labelInput = await canvas.findByText('Google');
    const linkInput = await canvas.findByText('https://www.google.com');

    await userEvent.type(labelInput, 'Yahoo');
    await userEvent.type(linkInput, 'https://www.yahoo.com');

    expect(args.onChange).not.toHaveBeenCalled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
