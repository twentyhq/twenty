import { Locator, Page } from '@playwright/test';

export class SettingsPage {
  private readonly exitSettingsLink: Locator;
  private readonly profileLink: Locator;
  private readonly experienceLink: Locator;
  private readonly accountsLink: Locator;
  private readonly emailsLink: Locator;
  private readonly calendarsLink: Locator;
  private readonly generalLink: Locator;
  private readonly membersLink: Locator;
  private readonly dataModelLink: Locator;
  private readonly developersLink: Locator;
  private readonly functionsLink: Locator;
  private readonly securityLink: Locator;
  private readonly integrationsLink: Locator;
  private readonly releasesLink: Locator;
  private readonly logoutLink: Locator;
  private readonly advancedToggle: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.exitSettingsLink = page.getByRole('button', { name: 'Exit Settings' });
    this.profileLink = page.getByRole('link', { name: 'Profile' });
    this.experienceLink = page.getByRole('link', { name: 'Experience' });
    this.accountsLink = page.getByRole('link', { name: 'Accounts' });
    this.emailsLink = page.getByRole('link', { name: 'Emails', exact: true });
    this.calendarsLink = page.getByRole('link', { name: 'Calendars' });
    this.generalLink = page.getByRole('link', { name: 'General' });
    this.membersLink = page.getByRole('link', { name: 'Members' });
    this.dataModelLink = page.getByRole('link', { name: 'Data model' });
    this.developersLink = page.getByRole('link', { name: 'Developers' });
    this.functionsLink = page.getByRole('link', { name: 'Functions' });
    this.integrationsLink = page.getByRole('link', { name: 'Integrations' });
    this.securityLink = page.getByRole('link', { name: 'Security' });
    this.releasesLink = page.getByRole('link', { name: 'Releases' });
    this.logoutLink = page.getByText('Logout');
    this.advancedToggle = page.locator('input[type="checkbox"]').first();
  }

  async leaveSettingsPage() {
    await this.exitSettingsLink.click();
  }

  async goToProfileSection() {
    await this.profileLink.click();
  }

  async goToExperienceSection() {
    await this.experienceLink.click();
  }

  async goToAccountsSection() {
    await this.accountsLink.click();
  }

  async goToEmailsSection() {
    await this.emailsLink.click();
  }

  async goToCalendarsSection() {
    await this.calendarsLink.click();
  }

  async goToGeneralSection() {
    await this.generalLink.click();
  }

  async goToMembersSection() {
    await this.membersLink.click();
  }

  async goToDataModelSection() {
    await this.dataModelLink.click();
  }

  async goToDevelopersSection() {
    await this.developersLink.click();
  }

  async goToFunctionsSection() {
    await this.functionsLink.click();
  }

  async goToSecuritySection() {
    await this.securityLink.click();
  }

  async goToIntegrationsSection() {
    await this.integrationsLink.click();
  }

  async goToReleasesIntegration() {
    await this.releasesLink.click();
  }

  async logout() {
    await this.logoutLink.click();
  }

  async toggleAdvancedSettings() {
    await this.advancedToggle.click();
  }
}
