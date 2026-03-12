describe('Settings - Experience', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/experience');
    cy.waitForAppLoaded();
  });

  it('should display the experience settings page', () => {
    cy.url().should('include', '/settings/experience');
  });

  it('should show date and time format settings', () => {
    cy.get('body').should('be.visible');
    // Experience page typically has date/time/timezone settings
    cy.contains(/date|time|timezone|format/i, { timeout: 10000 }).should(
      'exist',
    );
  });
});
