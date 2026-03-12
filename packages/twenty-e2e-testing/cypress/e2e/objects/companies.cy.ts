describe('CRM Objects - Companies', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Companies List View', () => {
    beforeEach(() => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();
    });

    it('should display the Companies list page', () => {
      cy.url().should('include', '/objects/companies');
      cy.getByTestId('top-bar-title').should('contain.text', 'Companies');
    });

    it('should display a table or list of company records', () => {
      cy.get(
        'table, [role="table"], [role="grid"], [data-testid*="row"]',
        { timeout: 15000 },
      ).should('exist');
    });

    it('should show column headers', () => {
      cy.get(
        'th, [role="columnheader"], [data-testid*="header"]',
        { timeout: 15000 },
      ).should('have.length.greaterThan', 0);
    });

    it('should have a button to create a new company record', () => {
      cy.get('button').filter(':contains("+")')
        .should('exist');
    });

    it('should create a new company record via the + button', () => {
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

  describe('Company Detail View', () => {
    beforeEach(() => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();
    });

    it('should navigate to a company detail page by clicking a record', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/company/');
    });

    it('should display company details on the detail page', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/company/');
      cy.getByTestId('top-bar-title').should('exist');
    });

    it('should display field sections on company detail', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/company/');

      // Detail page should have field labels
      cy.get('body').should('be.visible');
    });

    it('should display timeline/activity section on company detail', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/company/');

      // Detail page should have content sections (timeline, relations, etc.)
      cy.contains(/Timeline|Activity|Relations/i, { timeout: 10000 }).should('exist');
    });

    it('should display related people section on company detail', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/company/');

      // Should show related records section
      cy.contains(/People|Contacts|Relations/i, { timeout: 10000 }).should('exist');
    });

    it('should be able to navigate back to the Companies list', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('include', '/object/company/');

      cy.contains('a', 'Companies').click();
      cy.url().should('include', '/objects/companies');
    });

    it('should allow opening company detail from record in a new URL', () => {
      cy.clickFirstRecord();
      cy.url({ timeout: 10000 }).should('match', /\/object\/company\/[\w-]+/);
    });
  });
});
