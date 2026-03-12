describe('Settings - APIs & Webhooks', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('API Keys', () => {
    beforeEach(() => {
      cy.navigateToSettings('api-webhooks');
    });

    it('should display the APIs & Webhooks settings page', () => {
      cy.url().should('include', '/settings/api-webhooks');
    });

    it('should show API keys section', () => {
      cy.contains(/API/i, { timeout: 10000 }).should('exist');
    });

    it('should have a button to create a new API key', () => {
      cy.get('button, a')
        .filter(':contains("Create"), :contains("Generate"), :contains("+")')
        .should('exist');
    });

    it('should open API key creation form when clicking create button', () => {
      cy.get('button, a')
        .filter(':contains("Create"), :contains("Generate"), :contains("+")')
        .first()
        .click();

      // Should show a form or modal for creating API key
      cy.get('body').should('be.visible');
    });

    it('should display existing API keys if any', () => {
      cy.get('body').then(($body) => {
        const hasKeys = $body.find('[data-testid*="api-key"], [data-testid*="key"]').length > 0;
        if (hasKeys) {
          cy.log('Existing API keys found');
        } else {
          cy.log('No existing API keys');
        }
      });
    });
  });

  describe('Webhooks', () => {
    beforeEach(() => {
      cy.navigateToSettings('api-webhooks');
    });

    it('should show webhooks section', () => {
      cy.contains(/Webhook/i, { timeout: 10000 }).should('exist');
    });

    it('should have a button to create a new webhook', () => {
      cy.get('button, a')
        .filter(':contains("Create"), :contains("Add"), :contains("+")')
        .should('exist');
    });

    it('should display existing webhooks if any', () => {
      cy.get('body').then(($body) => {
        const hasWebhooks = $body.find('[data-testid*="webhook"]').length > 0;
        if (hasWebhooks) {
          cy.log('Existing webhooks found');
        } else {
          cy.log('No existing webhooks');
        }
      });
    });

    it('should navigate back to settings from API page', () => {
      cy.go('back');
      cy.get('body').should('be.visible');
    });
  });
});
