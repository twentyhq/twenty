import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

const I18nWrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const SELECT_OPTIONS = [
  { label: 'Open', value: 'OPEN', color: 'green' as const },
  {
    label: 'Meeting',
    value: 'MEETING',
    color: 'blue' as const,
    isActive: false,
  },
];

it('does not offer a deactivated option in a record form select', async () => {
  const user = userEvent.setup();

  render(
    <FormFieldInput
      field={{
        label: 'Stage',
        type: FieldMetadataType.SELECT,
        metadata: {
          fieldName: 'stage',
          options: SELECT_OPTIONS,
          isNullable: true,
        },
      }}
      defaultValue={null}
      onChange={() => {}}
    />,
    { wrapper: I18nWrapper },
  );

  await user.click(screen.getByText('No Stage'));

  expect(await screen.findByText('Open')).toBeVisible();
  expect(screen.queryByText('Meeting')).not.toBeInTheDocument();
});

it('keeps an already-selected deactivated option in a record form multi-select', async () => {
  const user = userEvent.setup();

  render(
    <FormFieldInput
      field={{
        label: 'Tags',
        type: FieldMetadataType.MULTI_SELECT,
        metadata: {
          fieldName: 'tags',
          options: [
            ...SELECT_OPTIONS,
            {
              label: 'Paused',
              value: 'PAUSED',
              color: 'gray' as const,
              isActive: false,
            },
          ],
        },
      }}
      defaultValue={['PAUSED']}
      onChange={() => {}}
    />,
    { wrapper: I18nWrapper },
  );

  await user.click(screen.getByRole('button', { name: 'Tags' }));

  expect(await screen.findByText('Open')).toBeVisible();
  expect(screen.getAllByText('Paused').length).toBeGreaterThan(0);
  expect(screen.queryByText('Meeting')).not.toBeInTheDocument();
});
