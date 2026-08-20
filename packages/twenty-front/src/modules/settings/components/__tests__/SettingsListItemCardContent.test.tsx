import { SettingsListItemCardContent } from '@/settings/components/SettingsListItemCardContent';
import { render, screen } from '@testing-library/react';

describe('SettingsListItemCardContent', () => {
  it('highlights callback-driven rows on hover', () => {
    render(
      <SettingsListItemCardContent
        label="Callback row"
        onClick={jest.fn()}
        rightComponent={null}
      />,
    );

    expect(
      screen.getByText('Callback row').closest('[data-clickable]'),
    ).toHaveAttribute('data-hover-highlight', 'true');
  });
});
