import { useState } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsSecurityIframeOrigins } from '@/settings/security/components/SettingsSecurityIframeOrigins';
import { type SettingsTextInputProps } from '@/ui/input/components/SettingsTextInput';

const updateWorkspace = jest.fn();
const enqueueToast = jest.fn();
let initialOrigins: string[] = [];

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [updateWorkspace, { loading: false }],
}));

jest.mock('@linaria/react', () => ({
  styled: { div: () => 'div', span: () => 'span' },
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomState', () => ({
  useAtomState: () =>
    useState({ id: 'workspace-id', allowedIframeOrigins: initialOrigins }),
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast }),
}));

jest.mock('@/ui/input/components/SettingsTextInput', () => ({
  SettingsTextInput: ({
    label,
    value,
    onChange,
    disabled,
    error,
  }: SettingsTextInputProps) => (
    <label>
      {label}
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {error && <span role="alert">{error}</span>}
    </label>
  ),
}));

const renderSettings = () =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsSecurityIframeOrigins />
    </I18nProvider>,
  );

beforeEach(() => {
  initialOrigins = [];
  jest.clearAllMocks();
  updateWorkspace.mockImplementation(async ({ variables }) => ({
    data: {
      updateWorkspace: {
        allowedIframeOrigins: variables.input.allowedIframeOrigins,
      },
    },
  }));
});

it('saves normalized origins and allows removing the last origin', async () => {
  const user = userEvent.setup();
  renderSettings();

  await user.type(
    screen.getByRole('textbox', { name: 'Allowed origin' }),
    'https://PORTAL.example.com:443/',
  );
  await user.click(screen.getByRole('button', { name: 'Add origin' }));

  expect(updateWorkspace).toHaveBeenLastCalledWith({
    variables: {
      input: { allowedIframeOrigins: ['https://portal.example.com'] },
    },
  });
  await user.click(
    await screen.findByRole('button', {
      name: 'Remove https://portal.example.com',
    }),
  );
  expect(updateWorkspace).toHaveBeenLastCalledWith({
    variables: { input: { allowedIframeOrigins: [] } },
  });
  expect(
    screen.queryByRole('button', { name: /Remove/ }),
  ).not.toBeInTheDocument();
});

it('explains invalid origins without sending a mutation', async () => {
  const user = userEvent.setup();
  renderSettings();

  await user.type(
    screen.getByRole('textbox', { name: 'Allowed origin' }),
    'https://portal.example.com/path',
  );
  await user.click(screen.getByRole('button', { name: 'Add origin' }));

  expect(screen.getByRole('alert')).toHaveTextContent(
    'without a path or wildcard',
  );
  expect(updateWorkspace).not.toHaveBeenCalled();
});

it('keeps saved origins when the server rejects an update', async () => {
  initialOrigins = ['https://portal.example.com'];
  updateWorkspace.mockRejectedValueOnce(new Error('Permission denied'));
  const user = userEvent.setup();
  renderSettings();

  await user.click(
    screen.getByRole('button', { name: 'Remove https://portal.example.com' }),
  );

  expect(
    screen.getByRole('button', { name: 'Remove https://portal.example.com' }),
  ).toBeInTheDocument();
  expect(enqueueToast).toHaveBeenCalled();
});

it('prevents adding more than twenty origins', () => {
  initialOrigins = Array.from(
    { length: 20 },
    (_, index) => `https://portal${index}.example.com`,
  );
  renderSettings();

  expect(
    screen.getByRole('textbox', { name: 'Allowed origin' }),
  ).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Add origin' })).toBeDisabled();
});
