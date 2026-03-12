describe('Navigation - Routing', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should load the home page at /', () => {
    cy.visit('/');
    cy.waitForAppLoaded();
    cy.url().should('not.include', '/welcome');
  });

  it('should navigate to /objects/people via URL', () => {
    cy.visit('/objects/people');
    cy.waitForAppLoaded();
    cy.url().should('include', '/objects/people');
  });

  it('should navigate to /objects/companies via URL', () => {
    cy.visit('/objects/companies');
    cy.waitForAppLoaded();
    cy.url().should('include', '/objects/companies');
  });

  it('should navigate to /objects/opportunities via URL', () => {
    cy.visit('/objects/opportunities');
    cy.waitForAppLoaded();
    cy.url().should('include', '/objects/opportunities');
  });

  it('should navigate to /settings/profile via URL', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/profile');
  });

  it('should navigate to /settings/general via URL', () => {
    cy.visit('/settings/general');
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/general');
  });

  it('should navigate to /settings/objects (data model) via URL', () => {
    cy.visit('/settings/objects');
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/objects');
  });

  it('should navigate to /settings/members via URL', () => {
    cy.visit('/settings/members');
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/members');
  });

  it('should handle 404 for invalid routes gracefully', () => {
    cy.visit('/nonexistent-page-12345', { failOnStatusCode: false });
    // Should either redirect or show an error page - not crash
    cy.get('body').should('be.visible');
  });
});
