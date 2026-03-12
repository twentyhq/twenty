describe('Settings - Profile', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToSettings('profile');
  });

  describe('Profile Information', () => {
    it('should display the profile settings page', () => {
      cy.url().should('include', '/settings/profile');
    });

    it('should show user profile input fields', () => {
      cy.get('input').should('have.length.greaterThan', 0);
    });

    it('should show first name field', () => {
      cy.get('input[name*="first"], input[placeholder*="First"]', { timeout: 10000 })
        .should('exist');
    });

    it('should show last name field', () => {
      cy.get('input[name*="last"], input[placeholder*="Last"]', { timeout: 10000 })
        .should('exist');
    });

    it('should have editable name fields', () => {
      cy.get('input').first().should('not.be.disabled');
    });

    it('should show profile avatar or image area', () => {
      cy.get('img, [data-testid*="avatar"], [data-testid*="profile"], [data-testid*="upload"]', {
        timeout: 10000,
      }).should('exist');
    });

    it('should display user email', () => {
      cy.get('body').should('contain.text', Cypress.env('DEFAULT_LOGIN'));
    });
  });

  describe('Settings Navigation', () => {
    it('should show the settings navigation drawer', () => {
      cy.contains('Profile').should('be.visible');
    });

    it('should navigate to General settings', () => {
      cy.contains('a', 'General').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/general');
    });

    it('should navigate to Members settings', () => {
      cy.contains('a', 'Members').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/members');
    });

    it('should navigate to Experience settings', () => {
      cy.contains('a', /experience/i).click();
      cy.url({ timeout: 10000 }).should('include', '/settings/experience');
    });

    it('should navigate to Accounts settings', () => {
      cy.contains('a', /accounts/i).click();
      cy.url({ timeout: 10000 }).should('include', '/settings/accounts');
    });
  });

  describe('Profile Persistence', () => {
    it('should persist profile data after reload', () => {
      cy.reload();
      cy.waitForAppLoaded();
      cy.url().should('include', '/settings/profile');
      cy.get('input').should('have.length.greaterThan', 0);
    });
  });
});
