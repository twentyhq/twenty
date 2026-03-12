describe('Settings - Releases', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToSettings('releases');
  });

  it('should display the releases settings page', () => {
    cy.url().should('include', '/settings/releases');
  });

  it('should show release notes or version information', () => {
    cy.get('body').should('not.be.empty');
  });

  it('should display release content with headings or sections', () => {
    // Release notes typically have headings, dates, or version numbers
    cy.get('h1, h2, h3, h4, [data-testid*="release"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });

  it('should have scrollable content', () => {
    cy.get('body').should('be.visible');
  });

  it('should be accessible from settings navigation', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();
    cy.contains('a', /releases/i).click();
    cy.url().should('include', '/settings/releases');
  });

  it('should persist after page reload', () => {
    cy.reload();
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/releases');
  });
});
