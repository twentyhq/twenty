import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { SettingsApplicationVariableLabelRow } from '~/pages/settings/applications/components/SettingsApplicationVariableLabelRow';

const renderLabelRow = (label?: string) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationVariableLabelRow
        variableKey="MY_VARIABLE_KEY"
        label={label}
        isDeprecated={false}
        description=""
        tooltipId="tooltip-id"
      />
    </I18nProvider>,
  );

describe('SettingsApplicationVariableLabelRow', () => {
  it('displays the label when provided', () => {
    renderLabelRow('My variable');

    expect(screen.getByText('My variable')).toBeVisible();
    expect(screen.queryByText('MY_VARIABLE_KEY')).not.toBeInTheDocument();
  });

  it('falls back to the variable key without a label', () => {
    renderLabelRow();

    expect(screen.getByText('MY_VARIABLE_KEY')).toBeVisible();
  });
});
