import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { SettingsApplicationCommandMenuItemSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationCommandMenuItemSettingsTab';

type RenderSettingsTabOptions = {
  fieldName?: string;
  conditionalVariantExpression?: string | null;
};

const renderSettingsTab = ({
  fieldName,
  conditionalVariantExpression,
}: RenderSettingsTabOptions = {}) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationCommandMenuItemSettingsTab
        label="Generate meeting link"
        isPinned={false}
        availabilityType="RECORD_FIELD"
        fieldName={fieldName}
        conditionalVariantExpression={conditionalVariantExpression}
        createdAt="2026-09-24T12:00:00.000Z"
        updatedAt="2026-09-24T12:00:00.000Z"
      />
    </I18nProvider>,
  );

const getRowValue = (label: string) =>
  screen.getByText(label).nextElementSibling?.textContent;

describe('SettingsApplicationCommandMenuItemSettingsTab', () => {
  it('shows the field the button sits next to', () => {
    renderSettingsTab({ fieldName: 'Company → Meeting link' });

    expect(getRowValue('Field')).toBe('Company → Meeting link');
  });

  it('shows the conditional variant expression', () => {
    renderSettingsTab({
      conditionalVariantExpression: 'isPrimary ? "PRIMARY" : "SECONDARY"',
    });

    expect(getRowValue('Conditional variant')).toBe(
      'isPrimary ? "PRIMARY" : "SECONDARY"',
    );
  });

  it('shows "Not set" when the item has no field and no variant expression', () => {
    renderSettingsTab();

    expect(getRowValue('Field')).toBe('Not set');
    expect(getRowValue('Conditional variant')).toBe('Not set');
  });
});
