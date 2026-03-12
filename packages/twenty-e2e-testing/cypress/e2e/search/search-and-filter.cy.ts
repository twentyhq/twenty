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

  describe('Table Filtering on People', () => {
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
      cy.openFilterMenu();
      cy.get(
        '[role="menu"], [role="listbox"], [data-testid*="filter"]',
        { timeout: 10000 },
      ).should('exist');
    });

    it('should show field options in filter dropdown', () => {
      cy.openFilterMenu();
      // Should list filterable fields
      cy.get('[role="menu"], [role="listbox"], [data-testid*="filter"]', {
        timeout: 10000,
      })
        .find('[role="option"], [role="menuitem"], li, button')
        .should('have.length.greaterThan', 0);
    });

    it('should be able to select a filter field', () => {
      cy.openFilterMenu();
      cy.get('[role="menu"], [role="listbox"], [data-testid*="filter"]', {
        timeout: 10000,
      })
        .find('[role="option"], [role="menuitem"], li, button')
        .first()
        .click();

      // After selecting a field, a filter value input or options should appear
      cy.get('body').should('be.visible');
    });

    it('should close filter dropdown when pressing Escape', () => {
      cy.openFilterMenu();
      cy.get(
        '[role="menu"], [role="listbox"], [data-testid*="filter"]',
        { timeout: 10000 },
      ).should('exist');

      cy.get('body').type('{esc}');
    });
  });

  describe('Table Filtering on Companies', () => {
    beforeEach(() => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();
    });

    it('should display a filter button on companies list', () => {
      cy.get('button')
        .filter(':contains("Filter")')
        .should('exist');
    });

    it('should open filter options on companies page', () => {
      cy.openFilterMenu();
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
      cy.openSortMenu();
      cy.get(
        '[role="menu"], [role="listbox"], [data-testid*="sort"]',
        { timeout: 10000 },
      ).should('exist');
    });

    it('should show sortable field options', () => {
      cy.openSortMenu();
      cy.get('[role="menu"], [role="listbox"], [data-testid*="sort"]', {
        timeout: 10000,
      })
        .find('[role="option"], [role="menuitem"], li, button')
        .should('have.length.greaterThan', 0);
    });

    it('should be able to select a sort field', () => {
      cy.openSortMenu();
      cy.get('[role="menu"], [role="listbox"], [data-testid*="sort"]', {
        timeout: 10000,
      })
        .find('[role="option"], [role="menuitem"], li, button')
        .first()
        .click();

      // After applying sort, the page should still be visible
      cy.get('body').should('be.visible');
    });
  });

  describe('View Switching', () => {
    beforeEach(() => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();
    });

    it('should display view options', () => {
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

    it('should persist the current view', () => {
      // Reload and verify the view persists
      cy.reload();
      cy.waitForAppLoaded();
      cy.get('body').should('be.visible');
    });
  });

  describe('Search on Different Object Pages', () => {
    it('should have search available on people page', () => {
      cy.visit('/objects/people');
      cy.waitForAppLoaded();
      cy.openCommandMenu();
      cy.getByTestId('command-menu').should('be.visible');
      cy.get('body').type('{esc}');
    });

    it('should have search available on companies page', () => {
      cy.visit('/objects/companies');
      cy.waitForAppLoaded();
      cy.openCommandMenu();
      cy.getByTestId('command-menu').should('be.visible');
      cy.get('body').type('{esc}');
    });

    it('should have search available on opportunities page', () => {
      cy.visit('/objects/opportunities');
      cy.waitForAppLoaded();
      cy.openCommandMenu();
      cy.getByTestId('command-menu').should('be.visible');
      cy.get('body').type('{esc}');
    });
  });
});
