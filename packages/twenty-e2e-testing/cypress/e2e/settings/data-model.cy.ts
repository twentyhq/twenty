describe('Settings - Data Model', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/objects');
    cy.waitForAppLoaded();
  });

  it('should display the data model settings page', () => {
    cy.url().should('include', '/settings/objects');
  });

  it('should show standard objects (People, Companies, etc.)', () => {
    // The data model page should list standard CRM objects
    cy.contains('People', { timeout: 10000 }).should('exist');
    cy.contains('Companies', { timeout: 10000 }).should('exist');
  });

  it('should show custom objects section', () => {
    // There should be a section for custom objects or a way to create them
    cy.get('body').should('be.visible');
    cy.contains('Custom', { timeout: 10000 }).should('exist');
  });

  it('should navigate to object detail when clicking an object', () => {
    cy.contains('People').click();
    cy.url({ timeout: 10000 }).should('include', '/settings/objects/');
  });

  it('should show object fields on detail page', () => {
    cy.contains('People').click();
    cy.url({ timeout: 10000 }).should('include', '/settings/objects/');

    // Should show field names like Name, Email, Phone, etc.
    cy.get('body').should('be.visible');
    cy.contains('Name', { timeout: 10000 }).should('exist');
  });
});
