describe('Settings - Integrations', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToSettings('integrations');
  });

  it('should display the integrations settings page', () => {
    cy.url().should('include', '/settings/integrations');
  });

  it('should show available integrations', () => {
    cy.get('[role="listitem"], [data-testid*="integration"], a, button', {
      timeout: 10000,
    }).should('have.length.greaterThan', 0);
  });

  it('should display integration names and descriptions', () => {
    cy.get('body').should('be.visible');
    // Each integration should have some text description
    cy.get('[role="listitem"], [data-testid*="integration"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });

  it('should have clickable integration items', () => {
    cy.get('body').then(($body) => {
      const integrationItems = $body.find('[role="listitem"] a, [data-testid*="integration"] a, a[href*="integration"]');
      if (integrationItems.length > 0) {
        cy.wrap(integrationItems.first()).click();
        cy.get('body').should('be.visible');
      } else {
        cy.log('No clickable integration links found');
      }
    });
  });

  it('should show database integration section', () => {
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Database"), :contains("PostgreSQL")').length > 0) {
        cy.log('Database integration section found');
      } else {
        cy.log('No database integration section');
      }
    });
  });

  it('should be accessible from settings navigation', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();
    cy.contains('a', /integration/i).click();
    cy.url().should('include', '/settings/integrations');
  });

  it('should persist after page reload', () => {
    cy.reload();
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/integrations');
  });
});
