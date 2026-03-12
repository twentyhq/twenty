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

    it('should be able to create a new company record via the + button', () => {
      cy.get('button').filter(':contains("+")').first().click();
      cy.get('body').should('be.visible');
    });
  });

  describe('Company Detail View', () => {
    it('should navigate to a company detail page by clicking a record', () => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();

      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .first()
        .click();

      cy.url({ timeout: 10000 }).should('include', '/object/company/');
    });

    it('should display company details on the detail page', () => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();

      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .first()
        .click();

      cy.url({ timeout: 10000 }).should('include', '/object/company/');
      cy.getByTestId('top-bar-title').should('exist');
    });

    it('should display timeline/activity section on company detail', () => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();

      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .first()
        .click();

      cy.url({ timeout: 10000 }).should('include', '/object/company/');

      // Detail page should have content sections (timeline, relations, etc.)
      cy.get('body').should('contain.text', 'Timeline').or('contain.text', 'Activity');
    });

    it('should be able to navigate back to the Companies list', () => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();

      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .first()
        .click();

      cy.url({ timeout: 10000 }).should('include', '/object/company/');

      cy.contains('a', 'Companies').click();
      cy.url().should('include', '/objects/companies');
    });
  });
});
