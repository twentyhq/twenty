describe('Settings - General (Workspace)', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/general');
    cy.waitForAppLoaded();
  });

  it('should display the workspace general settings page', () => {
    cy.url().should('include', '/settings/general');
  });

  it('should show workspace name field', () => {
    cy.get('input').should('have.length.greaterThan', 0);
  });

  it('should show workspace logo or icon', () => {
    // There should be some workspace branding element
    cy.get('img, [data-testid*="logo"], [data-testid*="workspace"]').should(
      'exist',
    );
  });

  it('should display the danger zone with delete workspace option', () => {
    // Scroll down to find danger zone
    cy.contains('Danger zone', { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible');
  });
});
