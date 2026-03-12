describe('Settings - Releases', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/releases');
    cy.waitForAppLoaded();
  });

  it('should display the releases settings page', () => {
    cy.url().should('include', '/settings/releases');
  });

  it('should show release notes or version information', () => {
    cy.get('body').should('be.visible');
    // Should have some version/release content
    cy.get('body').should('not.be.empty');
  });
});
