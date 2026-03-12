describe('Navigation - Command Menu', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.waitForAppLoaded();
  });

  it('should open command menu with keyboard shortcut Ctrl+K', () => {
    cy.get('body').type('{ctrl}k');
    cy.getByTestId('command-menu').should('be.visible');
  });

  it('should close command menu with Escape key', () => {
    cy.get('body').type('{ctrl}k');
    cy.getByTestId('command-menu').should('be.visible');

    cy.get('body').type('{esc}');
    cy.getByTestId('command-menu').should('not.exist');
  });

  it('should have a search input in the command menu', () => {
    cy.get('body').type('{ctrl}k');
    cy.getByTestId('command-menu').should('be.visible');

    cy.getByTestId('command-menu')
      .find('input')
      .should('exist')
      .and('be.visible');
  });

  it('should show results when typing a search query', () => {
    cy.get('body').type('{ctrl}k');
    cy.getByTestId('command-menu').should('be.visible');

    cy.getByTestId('command-menu').find('input').type('People');

    // Should show some results or navigation options
    cy.getByTestId('command-menu')
      .find('[role="option"], [role="listitem"], li, a')
      .should('have.length.greaterThan', 0);
  });

  it('should open command menu by clicking Search in sidebar', () => {
    cy.contains('Search').click();
    cy.getByTestId('command-menu').should('be.visible');
  });
});
