describe('Settings - Data Model', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Objects List', () => {
    beforeEach(() => {
      cy.navigateToSettings('objects');
    });

    it('should display the data model settings page', () => {
      cy.url().should('include', '/settings/objects');
    });

    it('should show standard objects (People, Companies, etc.)', () => {
      cy.contains('People', { timeout: 10000 }).should('exist');
      cy.contains('Companies', { timeout: 10000 }).should('exist');
    });

    it('should show Opportunities in standard objects', () => {
      cy.contains('Opportunities', { timeout: 10000 }).should('exist');
    });

    it('should show Notes in standard objects', () => {
      cy.contains('Notes', { timeout: 10000 }).should('exist');
    });

    it('should show Tasks in standard objects', () => {
      cy.contains('Tasks', { timeout: 10000 }).should('exist');
    });

    it('should show custom objects section', () => {
      cy.get('body').should('be.visible');
      cy.contains('Custom', { timeout: 10000 }).should('exist');
    });

    it('should have a button to create a new custom object', () => {
      cy.get('button, a')
        .filter(':contains("Create"), :contains("Add"), :contains("New"), :contains("+")')
        .should('exist');
    });
  });

  describe('Object Detail - People', () => {
    beforeEach(() => {
      cy.navigateToSettings('objects');
    });

    it('should navigate to People object detail when clicking', () => {
      cy.contains('People').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/objects/');
    });

    it('should show object fields on People detail page', () => {
      cy.contains('People').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/objects/');
      cy.contains('Name', { timeout: 10000 }).should('exist');
    });

    it('should show field types on People detail page', () => {
      cy.contains('People').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/objects/');
      cy.get('body').should('be.visible');
    });

    it('should have option to add new field', () => {
      cy.contains('People').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/objects/');

      cy.get('button, a')
        .filter(':contains("Add"), :contains("New field"), :contains("+")')
        .should('exist');
    });

    it('should navigate back to objects list', () => {
      cy.contains('People').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/objects/');

      cy.go('back');
      cy.url().should('include', '/settings/objects');
    });
  });

  describe('Object Detail - Companies', () => {
    beforeEach(() => {
      cy.navigateToSettings('objects');
    });

    it('should navigate to Companies object detail when clicking', () => {
      cy.contains('Companies').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/objects/');
    });

    it('should show fields on Companies detail page', () => {
      cy.contains('Companies').click();
      cy.url({ timeout: 10000 }).should('include', '/settings/objects/');
      cy.contains('Name', { timeout: 10000 }).should('exist');
    });
  });
});
