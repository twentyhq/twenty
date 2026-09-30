import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { setupI18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { I18nProvider } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Text } from 'twenty-ui/primitives/typography';
import {
  ComponentDecorator,
  overrideMediaQueryMatches,
} from 'twenty-ui/testing';
import { MOBILE_MEDIA_QUERY } from 'twenty-ui/utilities';
import { messages as frenchMessages } from '~/locales/generated/fr-FR';

const frenchI18n = setupI18n({
  locale: 'fr-FR',
  messages: { 'fr-FR': frenchMessages },
});

const CurrentLocation = () => {
  const { pathname } = useLocation();

  return (
    <Text render={<output aria-label="Current location" />}>{pathname}</Text>
  );
};

const meta: Meta<typeof Breadcrumb> = {
  title: 'UI/Navigation/Breadcrumb/Interactions',
  component: Breadcrumb,
  decorators: [ComponentDecorator],
  args: {
    links: [
      { children: 'Objects', href: '/objects' },
      { children: 'Companies', href: '/objects/companies' },
      { children: 'New' },
    ],
  },
  parameters: {
    container: { width: 350 },
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/objects/companies/new']}>
      <Breadcrumb {...args} />
      <CurrentLocation />
    </MemoryRouter>
  ),
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const RouterNavigation: Story = {
  beforeEach: () => overrideMediaQueryMatches({ [MOBILE_MEDIA_QUERY]: false }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole('navigation', { name: 'Breadcrumb' });
    const objectsLink = within(navigation).getByRole('link', {
      name: 'Objects',
    });
    const currentLocation = canvas.getByRole('status', {
      name: 'Current location',
    });

    await expect(objectsLink).toHaveAttribute('href', '/objects');
    await expect(within(navigation).getByText('New')).toHaveAttribute(
      'aria-current',
      'page',
    );
    objectsLink.focus();
    await expect(objectsLink).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(currentLocation.textContent).toBe('/objects');
    await userEvent.click(
      within(navigation).getByRole('link', { name: 'Companies' }),
    );
    await expect(currentLocation.textContent).toBe('/objects/companies');
  },
};

export const MobileSingleItem: Story = {
  beforeEach: () => overrideMediaQueryMatches({ [MOBILE_MEDIA_QUERY]: true }),
  args: {
    links: [{ children: 'Text Editor' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = await canvas.findByRole('navigation', {
      name: 'Breadcrumb',
    });

    await expect(within(navigation).getByText('Text Editor')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      within(navigation).queryByRole('link'),
    ).not.toBeInTheDocument();
  },
};

export const MobileSettingsBack: Story = {
  beforeEach: () => overrideMediaQueryMatches({ [MOBILE_MEDIA_QUERY]: true }),
  args: {
    links: [
      { children: 'User', href: '/settings/profile' },
      {
        children: <Trans>Account</Trans>,
        href: '/settings/accounts',
      },
      { children: 'Email' },
    ],
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/settings/accounts/email']}>
      <Breadcrumb {...args} />
      <CurrentLocation />
    </MemoryRouter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const backLink = await canvas.findByRole('link', {
      name: 'Back to Account',
    });

    await expect(backLink).toHaveAttribute('href', '/settings/accounts');
    await expect(
      canvas.queryByRole('link', { name: 'User' }),
    ).not.toBeInTheDocument();
    backLink.focus();
    await expect(backLink).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('status', { name: 'Current location' }).textContent,
    ).toBe('/settings/accounts');
  },
};

export const MobileSettingsRoot: Story = {
  beforeEach: () => overrideMediaQueryMatches({ [MOBILE_MEDIA_QUERY]: true }),
  args: {
    links: [
      { children: 'Workspace', href: '/settings/general' },
      { children: 'General' },
    ],
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/settings/general']}>
      <Breadcrumb {...args} />
      <CurrentLocation />
    </MemoryRouter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.queryByRole('navigation')).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('status', { name: 'Current location' }),
    ).toHaveTextContent('/settings/general');
  },
};

export const MobileTranslatedBack: Story = {
  ...MobileSettingsBack,
  render: (args) => (
    <I18nProvider i18n={frenchI18n}>
      <MemoryRouter initialEntries={['/settings/accounts/email']}>
        <Breadcrumb {...args} />
        <CurrentLocation />
      </MemoryRouter>
    </I18nProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = frenchI18n._(msg`Account`);
    const translatedBackLabel = frenchI18n._(msg`Back to ${text}`);

    await expect(translatedBackLabel).not.toBe(`Back to ${text}`);

    const backLink = await canvas.findByRole('link', {
      name: translatedBackLabel,
    });

    await userEvent.click(backLink);
    await expect(
      canvas.getByRole('status', { name: 'Current location' }).textContent,
    ).toBe('/settings/accounts');
  },
};
