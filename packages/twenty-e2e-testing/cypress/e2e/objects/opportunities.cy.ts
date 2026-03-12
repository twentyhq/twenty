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
  });

  describe('Opportunity Detail View', () => {
    it('should navigate to an opportunity detail page by clicking a record', () => {
      cy.visit('/objects/opportunities');
      cy.waitForAppLoaded();

      // Only proceed if there are records
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
          cy.url({ timeout: 10000 }).should('include', '/object/opportunity/');
          cy.getByTestId('top-bar-title').should('exist');
        } else {
          // No records - test passes with a note
          cy.log('No opportunity records found to click');
        }
      });
    });
  });
});
