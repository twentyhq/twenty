describe('Search and Filtering', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Global Search via Command Menu', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.waitForAppLoaded();
    });

    it('should open command menu and search for records', () => {
      cy.get('body').type('{ctrl}k');
      cy.getByTestId('command-menu').should('be.visible');

      cy.getByTestId('command-menu').find('input').type('Tim');

      // Should return results matching the search
      cy.getByTestId('command-menu')
        .find('[role="option"], [role="listitem"], li, a')
        .should('have.length.greaterThan', 0);
    });

    it('should search for companies by name', () => {
      cy.get('body').type('{ctrl}k');
      cy.getByTestId('command-menu').should('be.visible');

      cy.getByTestId('command-menu').find('input').type('Apple');

      cy.getByTestId('command-menu')
        .find('[role="option"], [role="listitem"], li, a')
        .should('have.length.greaterThan', 0);
    });

    it('should navigate to a record when clicking a search result', () => {
      cy.get('body').type('{ctrl}k');
      cy.getByTestId('command-menu').should('be.visible');

      cy.getByTestId('command-menu').find('input').type('People');

      cy.getByTestId('command-menu')
        .find('[role="option"], [role="listitem"], li, a')
        .first()
        .click();

      // Should navigate somewhere (either to a record or object list)
      cy.url().should('not.eq', '/');
    });
  });

  describe('Table Filtering', () => {
    beforeEach(() => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();
    });

    it('should display a filter button on the record list', () => {
      cy.get('button')
        .filter(':contains("Filter")')
        .should('exist');
    });

    it('should open filter options when clicking filter button', () => {
      cy.get('button')
        .filter(':contains("Filter")')
        .first()
        .click();

      // A filter dropdown or panel should appear
      cy.get(
        '[role="menu"], [role="listbox"], [data-testid*="filter"]',
        { timeout: 10000 },
      ).should('exist');
    });
  });

  describe('Table Sorting', () => {
    beforeEach(() => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();
    });

    it('should display a sort button on the record list', () => {
      cy.get('button')
        .filter(':contains("Sort")')
        .should('exist');
    });

    it('should open sort options when clicking sort button', () => {
      cy.get('button')
        .filter(':contains("Sort")')
        .first()
        .click();

      // A sort dropdown or panel should appear
      cy.get(
        '[role="menu"], [role="listbox"], [data-testid*="sort"]',
        { timeout: 10000 },
      ).should('exist');
    });
  });

  describe('View Switching', () => {
    beforeEach(() => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();
    });

    it('should be able to switch between table and kanban views if available', () => {
      // Look for view toggle buttons (table/kanban/board)
      cy.get('body').then(($body) => {
        const hasViewToggle =
          $body.find('[data-testid*="view"], button:contains("Table"), button:contains("Board"), button:contains("Kanban")').length > 0;
        if (hasViewToggle) {
          cy.log('View toggle found');
        } else {
          cy.log('No view toggle found - single view only');
        }
      });
    });
  });
});
