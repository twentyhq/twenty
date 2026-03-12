describe('Settings - Members', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/members');
    cy.waitForAppLoaded();
  });

  it('should display the members settings page', () => {
    cy.url().should('include', '/settings/members');
  });

  it('should show at least one member (the current user)', () => {
    // There should be at least one member row or card
    cy.get('body').should('contain.text', Cypress.env('DEFAULT_LOGIN'));
  });

  it('should show invite functionality', () => {
    // There should be an invite button or link
    cy.get('button, a')
      .filter(':contains("Invite")')
      .should('exist');
  });
});
