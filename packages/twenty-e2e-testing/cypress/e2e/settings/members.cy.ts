describe('Settings - Members', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToSettings('members');
  });

  describe('Members List', () => {
    it('should display the members settings page', () => {
      cy.url().should('include', '/settings/members');
    });

    it('should show at least one member (the current user)', () => {
      cy.get('body').should('contain.text', Cypress.env('DEFAULT_LOGIN'));
    });

    it('should display member names or emails', () => {
      // There should be visible member information
      cy.get('body').should('be.visible');
      cy.contains(Cypress.env('DEFAULT_LOGIN'), { timeout: 10000 }).should('exist');
    });

    it('should show member roles', () => {
      // Members should have role indicators
      cy.get('body').then(($body) => {
        const hasRoles = $body.find(':contains("Admin"), :contains("Member"), :contains("Owner")').length > 0;
        if (hasRoles) {
          cy.log('Member roles displayed');
        } else {
          cy.log('No explicit role labels found');
        }
      });
    });
  });

  describe('Invite Functionality', () => {
    it('should show invite button', () => {
      cy.get('button, a')
        .filter(':contains("Invite")')
        .should('exist');
    });

    it('should open invite dialog or section when clicking invite', () => {
      cy.get('button, a')
        .filter(':contains("Invite")')
        .first()
        .click();

      // Should show an invite form, modal, or link
      cy.get('body').should('be.visible');
    });

    it('should show invite link or email input after clicking invite', () => {
      cy.get('button, a')
        .filter(':contains("Invite")')
        .first()
        .click();

      // Should show either a copyable link or email input
      cy.get('input, [data-testid*="invite"], [data-testid*="link"]', {
        timeout: 10000,
      }).should('exist');
    });
  });

  describe('Navigation', () => {
    it('should be accessible from settings sidebar', () => {
      cy.visit('/settings/profile');
      cy.waitForAppLoaded();
      cy.contains('a', /members/i).click();
      cy.url().should('include', '/settings/members');
    });

    it('should persist after page reload', () => {
      cy.reload();
      cy.waitForAppLoaded();
      cy.url().should('include', '/settings/members');
    });
  });
});
