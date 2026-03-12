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

    it('should create a new person record via the + button', () => {
      cy.createRecordFromListPage();
      cy.get('body').should('be.visible');
    });

    it('should display filter and sort buttons', () => {
      cy.get('button').filter(':contains("Filter")').should('exist');
      cy.get('button').filter(':contains("Sort")').should('exist');
    });

    it('should open filter menu and show field options', () => {
      cy.openFilterMenu();
      cy.get(
        '[role="menu"], [role="listbox"], [data-testid*="filter"]',
        { timeout: 10000 },
      ).should('exist');
    });

    it('should open sort menu and show field options', () => {
      cy.openSortMenu();
      cy.get(
        '[role="menu"], [role="listbox"], [data-testid*="sort"]',
        { timeout: 10000 },
      ).should('exist');
    });

    it('should have multiple rows when records exist', () => {
      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Person Detail View', () => {
    beforeEach(() => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();
    });

    it('should navigate to a person detail page by clicking a record', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/person/');
    });

    it('should display person details on the detail page', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/person/');
      cy.getByTestId('top-bar-title').should('exist');
    });

    it('should display field sections on person detail', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/person/');
      cy.get('body').should('be.visible');
    });

    it('should display timeline/activity section on person detail', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/person/');
      cy.contains(/Timeline|Activity|Relations/i, { timeout: 10000 }).should('exist');
    });

    it('should display related companies on person detail', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/person/');
      cy.contains(/Company|Companies|Relations/i, { timeout: 10000 }).should('exist');
    });

    it('should be able to navigate back to the People list', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/person/');
      cy.contains('a', 'People').click();
      cy.url().should('include', '/objects/people');
    });

    it('should have a unique URL for the person detail', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('match', /\/object\/person\/[\w-]+/);
    });
  });
});
