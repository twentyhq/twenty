describe('Settings - APIs & Webhooks', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/api-webhooks');
    cy.waitForAppLoaded();
  });

  it('should display the APIs & Webhooks settings page', () => {
    cy.url().should('include', '/settings/api-webhooks');
  });

  it('should show API keys section', () => {
    cy.contains(/API/i, { timeout: 10000 }).should('exist');
  });

  it('should show webhooks section', () => {
    cy.contains(/Webhook/i, { timeout: 10000 }).should('exist');
  });

  it('should have a button to create a new API key', () => {
    cy.get('button, a')
      .filter(':contains("Create"), :contains("Generate"), :contains("+")')
      .should('exist');
  });
});
