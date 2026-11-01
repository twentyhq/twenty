import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsApplicationScreenshotGallery } from '@/settings/applications/components/SettingsApplicationScreenshotGallery';

const FIRST_SCREENSHOT = 'https://cdn.example.com/screenshot-1.png';
const SECOND_SCREENSHOT = 'https://cdn.example.com/screenshot-2.png';
const THIRD_SCREENSHOT = 'https://cdn.example.com/screenshot-3.png';

const renderGallery = () =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationScreenshotGallery
        screenshots={[FIRST_SCREENSHOT, SECOND_SCREENSHOT, THIRD_SCREENSHOT]}
        displayName="Stripe"
      />
    </I18nProvider>,
  );

const getHeroImage = () =>
  within(
    screen.getByRole('button', { name: 'View screenshot in full screen' }),
  ).getByRole('img');

const getThumbnailImage = (name: string) =>
  within(screen.getByRole('button', { name })).getByRole('presentation');

describe('SettingsApplicationScreenshotGallery', () => {
  it('shows the selected screenshot in the hero', async () => {
    renderGallery();

    await userEvent.click(
      screen.getByRole('button', { name: 'Stripe screenshot 2' }),
    );

    expect(getHeroImage()).toHaveAttribute('src', SECOND_SCREENSHOT);
  });

  it('keeps the selected screenshot when an earlier one fails to load', async () => {
    renderGallery();

    await userEvent.click(
      screen.getByRole('button', { name: 'Stripe screenshot 2' }),
    );

    fireEvent.error(getThumbnailImage('Stripe screenshot 1'));

    expect(getHeroImage()).toHaveAttribute('src', SECOND_SCREENSHOT);
    expect(getThumbnailImage('Stripe screenshot 1')).toHaveAttribute(
      'src',
      SECOND_SCREENSHOT,
    );
    expect(
      screen.getByRole('button', { name: 'Stripe screenshot 1' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.queryByRole('button', { name: 'Stripe screenshot 3' }),
    ).not.toBeInTheDocument();
  });

  it('falls back to the first remaining screenshot when the selected one fails', async () => {
    renderGallery();

    await userEvent.click(
      screen.getByRole('button', { name: 'Stripe screenshot 2' }),
    );

    fireEvent.error(getHeroImage());

    expect(getHeroImage()).toHaveAttribute('src', FIRST_SCREENSHOT);
  });
});
