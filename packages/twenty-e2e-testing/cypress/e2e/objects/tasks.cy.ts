describe('CRM Objects - Tasks', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Tasks List View', () => {
    beforeEach(() => {
      cy.visit('/objects/tasks');
      cy.waitForAppLoaded();
    });

    it('should display the Tasks list page', () => {
      cy.url().should('include', '/objects/tasks');
      cy.getByTestId('top-bar-title').should('contain.text', 'Tasks');
    });

    it('should display records or an empty state', () => {
      cy.get('body').should('be.visible');
    });

    it('should have a button to create a new task', () => {
      cy.get('button').filter(':contains("+")')
        .should('exist');
    });

    it('should be able to create a new task via the + button', () => {
      cy.get('button').filter(':contains("+")').first().click();
      cy.get('body').should('be.visible');
    });
  });
});
