import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { type DeveloperLinks } from '@/settings/applications/components/SettingsApplicationAboutSidebar';
import { SettingsApplicationDetailAboutTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailAboutTab';

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownRenderer: ({
    text,
    noImage,
  }: {
    text: string;
    noImage?: boolean;
  }) => (
    <div data-testid="markdown-renderer" data-no-image={noImage}>
      {text}
    </div>
  ),
}));

jest.mock('@/applications/components/AppChip', () => ({
  AppChip: () => <div data-testid="app-chip" />,
}));

const SHORT_DESCRIPTION =
  'The Stripe app lets you import customer data into your CRM.';
const ABOUT_DESCRIPTION =
  '## About\n\nEnhance your workspace with automated data intelligence.';
const DEVELOPER_LINKS: DeveloperLinks = {
  websiteUrl: 'https://stripe.com',
  termsUrl: 'https://stripe.com/terms',
  emailSupport: 'support@stripe.com',
  issueReportUrl: 'https://github.com/stripe/issues',
  sourcePackageUrl: 'https://www.npmjs.com/package/stripe-app',
};

type RenderAboutTabOptions = {
  aboutDescription?: string | null;
  description?: string | null;
  developerLinks?: DeveloperLinks;
  installCount?: number;
  onShare?: (() => void) | null;
};

// null opts out of a default, undefined keeps it.
const renderAboutTab = ({
  aboutDescription = ABOUT_DESCRIPTION,
  description = SHORT_DESCRIPTION,
  developerLinks = DEVELOPER_LINKS,
  installCount = 7,
  onShare = jest.fn(),
}: RenderAboutTabOptions = {}) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationDetailAboutTab
        displayName="Stripe"
        description={description ?? undefined}
        aboutDescription={aboutDescription ?? undefined}
        screenshots={[
          'https://cdn.example.com/screenshot-1.png',
          'https://cdn.example.com/screenshot-2.png',
        ]}
        author="Twenty"
        version="2.0"
        installCount={installCount}
        category="Finance"
        pricingDescription="Free"
        developerLinks={developerLinks}
        onShare={onShare ?? undefined}
      />
    </I18nProvider>,
  );

describe('SettingsApplicationDetailAboutTab', () => {
  it('hides the install count when nobody installed the application', () => {
    renderAboutTab({ installCount: 0 });

    expect(screen.queryByText(/installs?$/)).not.toBeInTheDocument();
  });

  it('estimates large install counts and reveals the exact count on hover', async () => {
    renderAboutTab({ installCount: 1098 });

    const estimatedInstallCount = screen.getByText('+1,000 installs');

    expect(estimatedInstallCount).toBeVisible();
    expect(screen.queryByText('1,098 installs')).not.toBeInTheDocument();

    await userEvent.setup().hover(estimatedInstallCount);

    expect(await screen.findByText('1,098 installs')).toBeVisible();
  });

  it('renders the application identity, metadata and resources', () => {
    renderAboutTab();

    expect(screen.getByText('Stripe')).toBeVisible();
    expect(screen.getByText(SHORT_DESCRIPTION)).toBeVisible();
    expect(screen.getByText('by Twenty')).toBeVisible();
    expect(screen.getByText('2.0')).toBeVisible();
    expect(screen.getByText('7 installs')).toBeVisible();
    expect(screen.getByText('Finance')).toBeVisible();
    expect(screen.getByText('Free')).toBeVisible();

    expect(screen.getByRole('link', { name: 'Website' })).toHaveAttribute(
      'href',
      'https://stripe.com',
    );
    expect(
      screen.getByRole('link', { name: 'Terms / Privacy' }),
    ).toHaveAttribute('href', 'https://stripe.com/terms');
    expect(screen.getByRole('link', { name: 'Email support' })).toHaveAttribute(
      'href',
      'mailto:support@stripe.com',
    );
    expect(
      screen.getByRole('link', { name: 'Report an issue' }),
    ).toHaveAttribute('href', 'https://github.com/stripe/issues');
    expect(screen.getByRole('link', { name: 'Npm package' })).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/stripe-app',
    );

    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'Enhance your workspace with automated data intelligence.',
    );
    expect(screen.getByTestId('markdown-renderer')).toHaveAttribute(
      'data-no-image',
      'true',
    );
  });

  it('shows the selected screenshot and lets the user switch it', async () => {
    const user = userEvent.setup();

    renderAboutTab();

    expect(screen.getByAltText('Stripe screenshot 1')).toHaveAttribute(
      'src',
      'https://cdn.example.com/screenshot-1.png',
    );

    await user.click(screen.getByAltText('Stripe thumbnail 2'));

    expect(screen.getByAltText('Stripe screenshot 2')).toHaveAttribute(
      'src',
      'https://cdn.example.com/screenshot-2.png',
    );
  });

  it('opens the screenshots in full screen and navigates between them', async () => {
    const user = userEvent.setup();

    renderAboutTab();

    await user.click(
      screen.getByRole('button', { name: 'View screenshot in full screen' }),
    );

    const lightbox = await screen.findByRole('dialog');

    expect(
      within(lightbox).getByAltText('Stripe screenshot 1'),
    ).toHaveAttribute('src', 'https://cdn.example.com/screenshot-1.png');

    await user.click(
      within(lightbox).getByRole('button', { name: 'Next screenshot' }),
    );

    expect(
      within(lightbox).getByAltText('Stripe screenshot 2'),
    ).toHaveAttribute('src', 'https://cdn.example.com/screenshot-2.png');

    await user.click(within(lightbox).getByRole('button', { name: 'Close' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('calls onShare when clicking the share button', async () => {
    const user = userEvent.setup();
    const onShare = jest.fn();

    renderAboutTab({ onShare });

    await user.click(screen.getByRole('button', { name: /^Share\b/ }));

    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('hides the share button when the application cannot be shared', () => {
    renderAboutTab({ onShare: null });

    expect(
      screen.queryByRole('button', { name: /^Share\b/ }),
    ).not.toBeInTheDocument();
  });

  it('skips resource links that are not http, https or mailto', () => {
    renderAboutTab({ developerLinks: { websiteUrl: 'ftp://stripe.com' } });

    expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Website' }),
    ).not.toBeInTheDocument();
  });

  it('does not repeat the short description as the about content', () => {
    renderAboutTab({ aboutDescription: null });

    expect(screen.getByText(SHORT_DESCRIPTION)).toBeVisible();
    expect(screen.queryByTestId('markdown-renderer')).not.toBeInTheDocument();
  });

  it('renders a long description as the about content and summarizes it in the sidebar', () => {
    renderAboutTab({
      aboutDescription: null,
      description:
        'Host your workspace customizations.\n\n#### What it includes\n\nEverything you build on top of the standard app.',
    });

    expect(
      screen.getByText('Host your workspace customizations.'),
    ).toBeVisible();
    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'What it includes',
    );
  });

  it('shows a placeholder when the application has no description at all', () => {
    renderAboutTab({ aboutDescription: null, description: null });

    expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
      'No description available for this application',
    );
  });
});
