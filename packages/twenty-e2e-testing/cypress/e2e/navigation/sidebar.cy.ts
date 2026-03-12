describe('Navigation - Sidebar', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.waitForAppLoaded();
  });

  it('should display the main navigation sidebar', () => {
    cy.get('nav, [role="navigation"]').should('exist').and('be.visible');
  });

  it('should show Search in the sidebar', () => {
    cy.contains('Search').should('be.visible');
  });

  it('should show Settings link in the sidebar', () => {
    cy.contains('Settings').should('be.visible');
  });

  it('should display workspace objects in the sidebar', () => {
    // Common CRM objects should appear in the navigation
    const expectedObjects = ['People', 'Companies', 'Opportunities'];

    expectedObjects.forEach((objectName) => {
      cy.contains(objectName).should('exist');
    });
  });

  it('should navigate to People list when clicking People', () => {
    cy.contains('a', 'People').click();
    cy.url().should('include', '/objects/people');
  });

  it('should navigate to Companies list when clicking Companies', () => {
    cy.contains('a', 'Companies').click();
    cy.url().should('include', '/objects/companies');
  });

  it('should navigate to Opportunities list when clicking Opportunities', () => {
    cy.contains('a', 'Opportunities').click();
    cy.url().should('include', '/objects/opportunities');
  });

  it('should navigate to Settings when clicking Settings', () => {
    cy.contains('Settings').click();
    cy.url({ timeout: 10000 }).should('include', '/settings');
  });

  it('should show the workspace dropdown', () => {
    cy.getByTestId('workspace-dropdown').should('exist');
  });

  it('should navigate to Tasks list when clicking Tasks', () => {
    cy.contains('a', 'Tasks').click();
    cy.url().should('include', '/objects/tasks');
  });

  it('should navigate to Notes list when clicking Notes', () => {
    cy.contains('a', 'Notes').click();
    cy.url().should('include', '/objects/notes');
  });
});
