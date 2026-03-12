describe('Settings - Roles', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/roles');
    cy.waitForAppLoaded();
  });

  it('should display the roles settings page', () => {
    cy.url().should('include', '/settings/roles');
  });

  it('should show existing roles', () => {
    // There should be at least one default role
    cy.get('body').should('be.visible');
    cy.contains(/role|admin|member/i, { timeout: 10000 }).should('exist');
  });
});
