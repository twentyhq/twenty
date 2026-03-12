describe('CRM Objects - Notes', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Notes List View', () => {
    beforeEach(() => {
      cy.visit('/objects/notes');
      cy.waitForAppLoaded();
    });

    it('should display the Notes list page', () => {
      cy.url().should('include', '/objects/notes');
      cy.getByTestId('top-bar-title').should('contain.text', 'Notes');
    });

    it('should display records or an empty state', () => {
      cy.get('body').should('be.visible');
    });

    it('should have a button to create a new note', () => {
      cy.get('button').filter(':contains("+")')
        .should('exist');
    });
  });
});
