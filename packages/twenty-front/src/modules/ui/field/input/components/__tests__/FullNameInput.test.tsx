import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FullNameInput } from '@/ui/field/input/components/FullNameInput';

const renderFullNameInput = (initialValue: FieldFullNameValue) => {
  const onChange = jest.fn();

  const FullNameInputWithValue = () => {
    const [value, setValue] = useState(initialValue);

    return (
      <FullNameInput
        instanceId="full-name-input-test"
        variant="inline"
        value={value}
        placeholder="Full name"
        firstNamePlaceholder="First name"
        lastNamePlaceholder="Last name"
        onChange={(fullName) => {
          onChange(fullName);
          setValue(fullName);
        }}
      />
    );
  };

  render(
    <I18nProvider i18n={i18n}>
      <FullNameInputWithValue />
    </I18nProvider>,
  );

  return { onChange };
};

describe('FullNameInput', () => {
  it('splits the typed name on its first word', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFullNameInput({ firstName: '', lastName: '' });

    await user.type(
      screen.getByRole('textbox', { name: 'Full name' }),
      'Jean de la Fontaine',
    );

    expect(onChange).toHaveBeenLastCalledWith({
      firstName: 'Jean',
      lastName: 'de la Fontaine',
    });
  });

  it('opens first and last name on demand', async () => {
    const user = userEvent.setup();
    renderFullNameInput({ firstName: 'Mary', lastName: 'Ann Smith' });

    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveValue(
      'Mary Ann Smith',
    );
    expect(
      screen.queryByRole('textbox', { name: 'First name' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Name details' }));

    expect(screen.getByRole('textbox', { name: 'First name' })).toHaveValue(
      'Mary',
    );
    expect(screen.getByRole('textbox', { name: 'Last name' })).toHaveValue(
      'Ann Smith',
    );
  });

  it('keeps a corrected compound first name when the last name changes', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFullNameInput({ firstName: '', lastName: '' });

    await user.click(screen.getByRole('button', { name: 'Name details' }));
    await user.type(
      screen.getByRole('textbox', { name: 'First name' }),
      'Mary Ann',
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Last name' }),
      'Smith',
    );

    const fullNameInput = screen.getByRole('textbox', { name: 'Full name' });

    expect(fullNameInput).toHaveValue('Mary Ann Smith');

    await user.type(fullNameInput, 'e');

    expect(onChange).toHaveBeenLastCalledWith({
      firstName: 'Mary Ann',
      lastName: 'Smithe',
    });
  });
});
