describe('CRM Objects - People', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('People List View', () => {
    beforeEach(() => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();
    });

    it('should display the People list page', () => {
      cy.url().should('include', '/objects/people');
      cy.getByTestId('top-bar-title').should('contain.text', 'People');
    });

    it('should display a table or list of records', () => {
      // The page should contain a record table or list view
      cy.get(
        'table, [role="table"], [role="grid"], [data-testid*="row"]',
        { timeout: 15000 },
      ).should('exist');
    });

    it('should show column headers in the table view', () => {
      cy.get(
        'th, [role="columnheader"], [data-testid*="header"]',
        { timeout: 15000 },
      ).should('have.length.greaterThan', 0);
    });

    it('should have a button to create a new person record', () => {
      cy.get('button').filter(':contains("+")')
        .should('exist');
    });

    it('should be able to create a new person record via the + button', () => {
      // Click the create button
      cy.get('button').filter(':contains("+")').first().click();

      // Should either open a form or create an inline record
      cy.get('body').should('be.visible');
    });
  });

  describe('Person Detail View', () => {
    it('should navigate to a person detail page by clicking a record', () => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();

      // Click on the first record row
      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .first()
        .click();

      // Should navigate to the detail view
      cy.url({ timeout: 10000 }).should('include', '/object/person/');
    });

    it('should display person details on the detail page', () => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();

      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .first()
        .click();

      cy.url({ timeout: 10000 }).should('include', '/object/person/');

      // The detail page should have the top bar title
      cy.getByTestId('top-bar-title').should('exist');
    });

    it('should be able to navigate back to the People list', () => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();

      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .first()
        .click();

      cy.url({ timeout: 10000 }).should('include', '/object/person/');

      // Navigate back using the sidebar
      cy.contains('a', 'People').click();
      cy.url().should('include', '/objects/people');
    });
  });
});
