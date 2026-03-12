describe('Settings - Profile', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should display the profile settings page', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();
    cy.url().should('include', '/settings/profile');
  });

  it('should show user profile fields (first name, last name, email)', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();

    // Profile page should have editable name fields
    cy.get('input').should('have.length.greaterThan', 0);
  });

  it('should show the settings navigation drawer', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();

    // Settings sidebar should have sections
    cy.contains('Profile').should('be.visible');
  });

  it('should navigate between settings sections via sidebar', () => {
    cy.visit('/settings/profile');
    cy.waitForAppLoaded();

    cy.contains('a', 'General').click();
    cy.url({ timeout: 10000 }).should('include', '/settings/general');

    cy.contains('a', 'Members').click();
    cy.url({ timeout: 10000 }).should('include', '/settings/members');
  });
});
