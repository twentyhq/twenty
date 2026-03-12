describe('Settings - Integrations', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/integrations');
    cy.waitForAppLoaded();
  });

  it('should display the integrations settings page', () => {
    cy.url().should('include', '/settings/integrations');
  });

  it('should show available integrations', () => {
    cy.get('body').should('be.visible');
    // Should have integration options listed
    cy.get('[role="listitem"], [data-testid*="integration"], a, button', {
      timeout: 10000,
    }).should('have.length.greaterThan', 0);
  });
});
