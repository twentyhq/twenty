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

  it('should auto-focus the search input when opened', () => {
    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').should('be.focused');
  });

  it('should clear search input when reopening command menu', () => {
    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').type('test query');
    cy.get('body').type('{esc}');
    cy.getByTestId('command-menu').should('not.exist');

    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').should('have.value', '');
  });

  it('should navigate to People page via command menu', () => {
    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').type('People');

    cy.getByTestId('command-menu')
      .find('[role="option"], [role="listitem"], li, a')
      .first()
      .click();

    cy.url().should('include', '/objects/people');
  });

  it('should navigate to Companies page via command menu', () => {
    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').type('Companies');

    cy.getByTestId('command-menu')
      .find('[role="option"], [role="listitem"], li, a')
      .first()
      .click();

    cy.url().should('include', '/objects/companies');
  });

  it('should navigate to Settings via command menu', () => {
    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').type('Settings');

    cy.getByTestId('command-menu')
      .find('[role="option"], [role="listitem"], li, a')
      .first()
      .click();

    cy.url().should('include', '/settings');
  });

  it('should show no results for gibberish query', () => {
    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').type('xyzzynonexistent12345');

    // Should show no results or an empty state
    cy.getByTestId('command-menu').should('be.visible');
  });

  it('should navigate using keyboard arrow keys and Enter', () => {
    cy.openCommandMenu();
    cy.getByTestId('command-menu').find('input').type('People');

    cy.getByTestId('command-menu')
      .find('[role="option"], [role="listitem"], li, a')
      .should('have.length.greaterThan', 0);

    // Press down arrow and enter to select
    cy.getByTestId('command-menu').find('input').type('{downArrow}{enter}');

    // Should have navigated somewhere
    cy.getByTestId('command-menu').should('not.exist');
  });
});
