import { ConfigVariableDatabaseInput } from '@/settings/admin-panel/config-variables/components/ConfigVariableDatabaseInput';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ConfigVariableType } from '~/generated-admin/graphql';

const ArrayExample = ({ disabled = false }: { disabled?: boolean }) => {
  const [values, setValues] = useState<string[]>(['Alpha']);
  return (
    <ConfigVariableDatabaseInput
      label="Allowed values"
      type={ConfigVariableType.ARRAY}
      value={values}
      options={['Alpha', 'Beta', 'Gamma']}
      onChange={(value) => setValues(value as string[])}
      disabled={disabled}
    />
  );
};

const InnerSelectExample = () => {
  const firstOption = { value: 'first', label: 'First' };
  const options = [
    firstOption,
    { value: 'disabled', label: 'Disabled', disabled: true },
    { value: 'last', label: 'Last' },
  ];
  const [option, setOption] = useState(firstOption);
  return (
    <DropdownMenuInnerSelect
      dropdownId="inner-select-story"
      aria-label="Position"
      selectedOption={option}
      options={options}
      onChange={setOption}
    />
  );
};

const meta: Meta = {
  title: 'UI/Input/OptionPickers',
  decorators: [ComponentDecorator],
};
export default meta;
type Story = StoryObj;

export const MultipleOptionsStayOpen: Story = {
  render: () => <ArrayExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button'));
    const beta = await body.findByRole('button', { name: 'Beta' });
    await userEvent.click(beta);
    expect(beta).toHaveAttribute('aria-pressed', 'true');
    expect(body.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(body.getByRole('button', { name: 'Gamma' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(body.getByRole('button', { name: 'Alpha' }));
    expect(within(canvasElement).getByRole('button')).toHaveTextContent(
      'Beta, Gamma',
    );
    await userEvent.keyboard('{Escape}');
  },
};

export const DisabledMultiplePicker: Story = {
  render: () => <ArrayExample disabled />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger);
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};

export const InnerSelectSkipsDisabled: Story = {
  render: () => <InnerSelectExample />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    expect(await body.findByRole('dialog', { name: 'Position' })).toBeVisible();
    expect(
      await body.findByRole('button', { name: 'Disabled' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveTextContent('Last');
  },
};
