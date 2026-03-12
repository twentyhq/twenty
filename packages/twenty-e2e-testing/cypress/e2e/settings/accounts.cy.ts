describe('Settings - Accounts', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Accounts Main Page', () => {
    it('should display the accounts settings page', () => {
      cy.visit('/settings/accounts');
      cy.waitForAppLoaded();
      cy.url().should('include', '/settings/accounts');
    });
  });

  describe('Emails Sub-page', () => {
    it('should display the email accounts page', () => {
      cy.visit('/settings/accounts/emails');
      cy.waitForAppLoaded();
      cy.url().should('include', '/settings/accounts/emails');
    });

    it('should show option to connect email account', () => {
      cy.visit('/settings/accounts/emails');
      cy.waitForAppLoaded();
      cy.get('button, a')
        .filter(':contains("Connect"), :contains("Add")')
        .should('exist');
    });
  });

  describe('Calendars Sub-page', () => {
    it('should display the calendar accounts page', () => {
      cy.visit('/settings/accounts/calendars');
      cy.waitForAppLoaded();
      cy.url().should('include', '/settings/accounts/calendars');
    });

    it('should show option to connect calendar', () => {
      cy.visit('/settings/accounts/calendars');
      cy.waitForAppLoaded();
      cy.get('button, a')
        .filter(':contains("Connect"), :contains("Add")')
        .should('exist');
    });
  });
});
