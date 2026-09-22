import { WorkflowClassifyQuestionCriteria } from '@/workflow/workflow-steps/workflow-actions/classify-action/components/WorkflowClassifyQuestionCriteria';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { type WorkflowClassifyCriterion } from 'twenty-shared/workflow';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const INITIAL_CRITERIA: WorkflowClassifyCriterion[] = [
  {
    id: 'lawyer',
    name: 'Lawyer',
    description: 'Advises clients on legal matters',
  },
  { id: 'engineer', name: 'Engineer', description: '' },
  { id: 'teacher', name: 'Teacher', description: '' },
];

const meta = {
  title: 'Modules/Workflow/Actions/Classify/Criteria',
  component: WorkflowClassifyQuestionCriteria,
  decorators: [
    WorkflowStepDecorator,
    ComponentDecorator,
    RouterDecorator,
    WorkspaceDecorator,
  ],
  parameters: { msw: graphqlMocks },
  args: {
    criteria: INITIAL_CRITERIA,
    variant: 'options',
    readonly: false,
    onChange: fn(),
  },
  render: function Render(args) {
    const [criteria, setCriteria] = useState(args.criteria);
    return (
      <WorkflowClassifyQuestionCriteria
        {...args}
        criteria={criteria}
        onChange={(updated) => {
          args.onChange(updated);
          setCriteria(updated);
        }}
      />
    );
  },
} satisfies Meta<typeof WorkflowClassifyQuestionCriteria>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeepsClearedRowsInPlace: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const engineer = await canvas.findByText('Engineer', { selector: 'p' });
    const input = engineer.closest<HTMLElement>('[contenteditable="true"]');
    if (!input) {
      throw new Error('Expected an editable option name');
    }
    await userEvent.clear(input);
    await expect(await canvas.findByText('Option 3 name')).toBeVisible();
    await expect(
      await canvas.findByText('Teacher', { selector: 'p' }),
    ).toBeVisible();
    await expect(args.onChange).toHaveBeenLastCalledWith([
      INITIAL_CRITERIA[0],
      { ...INITIAL_CRITERIA[1], name: '' },
      INITIAL_CRITERIA[2],
    ]);
    await userEvent.keyboard('Architect');
    await expect(
      await canvas.findByText('Architect', { selector: 'p' }),
    ).toBeVisible();
  },
};

export const DeletesAnOption: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = await canvas.findAllByRole('button', {
      name: 'Delete option',
    });
    await expect(buttons.at(-1)).toBeDisabled();
    await userEvent.click(buttons[0]);
    await expect(args.onChange).toHaveBeenLastCalledWith(
      INITIAL_CRITERIA.slice(1),
    );
    await expect(
      canvas.queryByText('Lawyer', { selector: 'p' }),
    ).not.toBeInTheDocument();
  },
};

export const ReadOnly: Story = {
  args: { readonly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Option 3 name')).toBeVisible();
    await expect(canvas.queryByText('Option 4 name')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Delete option' }),
    ).not.toBeInTheDocument();
  },
};

export const AtLevelLimit: Story = {
  args: { variant: 'levels', maxCriteria: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Level 3 name')).toBeVisible();
    await expect(canvas.queryByText('Level 4 name')).not.toBeInTheDocument();
  },
};

export const AddsTrailingOption: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const label = await canvas.findByText('Option 4 name');
    const input = label.parentElement?.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (!input) {
      throw new Error('Expected an editable trailing option');
    }
    await userEvent.click(input);
    await userEvent.keyboard('Doctor');
    await expect(
      await canvas.findByText('Doctor', { selector: 'p' }),
    ).toBeVisible();
    await expect(await canvas.findByText('Option 5 name')).toBeVisible();
    await expect(input).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith([
      ...INITIAL_CRITERIA,
      expect.objectContaining({ name: 'Doctor', description: '' }),
    ]);
  },
};
