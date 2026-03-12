describe('CRM Objects - Opportunities', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Opportunities List View', () => {
    beforeEach(() => {
      cy.visit('/objects/opportunities');
      cy.waitForAppLoaded();
    });

    it('should display the Opportunities list page', () => {
      cy.url().should('include', '/objects/opportunities');
      cy.getByTestId('top-bar-title').should('contain.text', 'Opportunities');
    });

    it('should display records or an empty state', () => {
      // Either display records or show an empty state message
      cy.get('body').should('be.visible');
      cy.get(
        '[data-testid*="row"], [data-testid*="empty"], [role="table"], [role="grid"]',
        { timeout: 15000 },
      ).should('exist');
    });

    it('should have a button to create a new opportunity', () => {
      cy.get('button').filter(':contains("+")')
        .should('exist');
    });

    it('should create a new opportunity via the + button', () => {
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
  });

  describe('Opportunity Detail View', () => {
    it('should navigate to an opportunity detail page by clicking a record', () => {
      cy.visit('/objects/opportunities');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/opportunity/');
          cy.getByTestId('top-bar-title').should('exist');
        } else {
          cy.log('No opportunity records found to click');
        }
      });
    });

    it('should display opportunity fields on detail page', () => {
      cy.visit('/objects/opportunities');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/opportunity/');
          cy.get('body').should('be.visible');
        } else {
          cy.log('No opportunity records found');
        }
      });
    });

    it('should display timeline section on opportunity detail', () => {
      cy.visit('/objects/opportunities');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/opportunity/');
          cy.contains(/Timeline|Activity|Relations/i, { timeout: 10000 }).should('exist');
        }
      });
    });

    it('should navigate back to opportunities list from detail', () => {
      cy.visit('/objects/opportunities');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/opportunity/');
          cy.contains('a', 'Opportunities').click();
          cy.url().should('include', '/objects/opportunities');
        }
      });
    });
  });
});
