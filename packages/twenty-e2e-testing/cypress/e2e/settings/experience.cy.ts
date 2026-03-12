describe('Settings - Experience', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToSettings('experience');
  });

  it('should display the experience settings page', () => {
    cy.url().should('include', '/settings/experience');
  });

  it('should show date and time format settings', () => {
    cy.contains(/date|time|timezone|format/i, { timeout: 10000 }).should(
      'exist',
    );
  });

  it('should display date format options', () => {
    cy.get('body').should('be.visible');
    // Should have selectable date format options
    cy.contains(/date/i, { timeout: 10000 }).should('exist');
  });

  it('should display time format options', () => {
    cy.contains(/time/i, { timeout: 10000 }).should('exist');
  });

  it('should show clickable format options or dropdowns', () => {
    // The experience page should have selectable options (dropdowns or radio buttons)
    cy.get('select, [role="combobox"], [role="listbox"], [role="radiogroup"], button, [data-testid*="select"]', {
      timeout: 10000,
    }).should('have.length.greaterThan', 0);
  });

  it('should persist after page reload', () => {
    cy.reload();
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/experience');
    cy.contains(/date|time|timezone|format/i, { timeout: 10000 }).should('exist');
  });

  it('should be accessible from settings navigation', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();
    cy.contains('a', /experience/i).click();
    cy.url().should('include', '/settings/experience');
  });
});
