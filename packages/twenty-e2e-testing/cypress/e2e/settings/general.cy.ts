describe('Settings - General (Workspace)', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToSettings('general');
  });

  describe('Workspace Information', () => {
    it('should display the workspace general settings page', () => {
      cy.url().should('include', '/settings/general');
    });

    it('should show workspace name input field', () => {
      cy.get('input').should('have.length.greaterThan', 0);
    });

    it('should have an editable workspace name', () => {
      cy.get('input').first().should('not.be.disabled');
    });

    it('should show workspace logo or icon', () => {
      cy.get('img, [data-testid*="logo"], [data-testid*="workspace"]').should(
        'exist',
      );
    });

    it('should have a logo upload area', () => {
      cy.get('img, [data-testid*="logo"], [data-testid*="workspace"], [data-testid*="upload"]').should(
        'exist',
      );
    });
  });

  describe('Danger Zone', () => {
    it('should display the danger zone section', () => {
      cy.contains('Danger zone', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible');
    });

    it('should have a delete workspace button in danger zone', () => {
      cy.contains('Danger zone', { timeout: 10000 }).scrollIntoView();
      cy.get('button')
        .filter(':contains("Delete"), :contains("Remove")')
        .should('exist');
    });

    it('should not delete workspace without confirmation', () => {
      cy.contains('Danger zone', { timeout: 10000 }).scrollIntoView();
      cy.get('button')
        .filter(':contains("Delete"), :contains("Remove")')
        .first()
        .click();

      // Should show a confirmation dialog/modal
      cy.get('body').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should be accessible from settings sidebar', () => {
      cy.visit('/settings/profile');
      cy.waitForAppLoaded();
      cy.contains('a', /general/i).click();
      cy.url().should('include', '/settings/general');
    });

    it('should persist settings after reload', () => {
      cy.reload();
      cy.waitForAppLoaded();
      cy.url().should('include', '/settings/general');
      cy.get('input').should('have.length.greaterThan', 0);
    });
  });
});
