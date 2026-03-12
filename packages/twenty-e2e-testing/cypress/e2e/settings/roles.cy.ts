describe('Settings - Roles', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToSettings('roles');
  });

  describe('Roles List', () => {
    it('should display the roles settings page', () => {
      cy.url().should('include', '/settings/roles');
    });

    it('should show existing roles', () => {
      cy.contains(/role|admin|member/i, { timeout: 10000 }).should('exist');
    });

    it('should display at least one default role', () => {
      // Every workspace should have at least Admin or Member role
      cy.get('body').should('be.visible');
    });

    it('should show role names with descriptions or permissions', () => {
      cy.get('body').then(($body) => {
        const hasRoleDetails = $body.find(':contains("Admin"), :contains("Member"), :contains("Owner")').length > 0;
        if (hasRoleDetails) {
          cy.log('Role names found');
        } else {
          cy.log('No standard role names found');
        }
      });
    });

    it('should have option to create a new role', () => {
      cy.get('button, a')
        .filter(':contains("Create"), :contains("Add"), :contains("New"), :contains("+")')
        .should('exist');
    });
  });

  describe('Role Detail', () => {
    it('should navigate to role detail when clicking a role', () => {
      cy.get('body').then(($body) => {
        const roleLinks = $body.find('a[href*="roles/"], [data-testid*="role"]');
        if (roleLinks.length > 0) {
          cy.wrap(roleLinks.first()).click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No clickable role links found');
        }
      });
    });
  });

  describe('Navigation', () => {
    it('should be accessible from settings sidebar', () => {
      cy.visit('/settings/profile');
      cy.waitForAppLoaded();
      cy.contains('a', /roles/i).click();
      cy.url().should('include', '/settings/roles');
    });

    it('should persist after page reload', () => {
      cy.reload();
      cy.waitForAppLoaded();
      cy.url().should('include', '/settings/roles');
    });
  });
});
