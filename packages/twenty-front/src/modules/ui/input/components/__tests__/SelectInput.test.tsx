import { SelectInput } from '@/ui/input/components/SelectInput';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={createStore()}>
    <I18nProvider i18n={i18n}>
      <DropdownRoot dropdownId="select-input" type="picker">
        <Dropdown.Trigger>Stage</Dropdown.Trigger>
        <Dropdown.Content aria-label="Stage options">
          {children}
        </Dropdown.Content>
      </DropdownRoot>
    </I18nProvider>
  </JotaiProvider>
);

const renderSelectInput = async () => {
  const user = userEvent.setup();

  render(
    <SelectInput
      options={[{ label: 'Open', value: 'OPEN' }]}
      onOptionSelected={() => {}}
      onAddSelectOption={() => {}}
      isExistingOptionName={(optionName) =>
        optionName.toLowerCase() === 'meeting'
      }
    />,
    { wrapper: Wrapper },
  );

  await user.click(screen.getByText('Stage'));

  return { user };
};

it('does not offer to add an option that already exists but is hidden', async () => {
  const { user } = await renderSelectInput();

  await user.type(await screen.findByLabelText('Search'), 'Meeting');

  expect(
    screen.queryByText('Add "Meeting" to options'),
  ).not.toBeInTheDocument();
});

it('offers to add an option that does not exist', async () => {
  const { user } = await renderSelectInput();

  await user.type(await screen.findByLabelText('Search'), 'Closed');

  expect(await screen.findByText('Add "Closed" to options')).toBeVisible();
});
