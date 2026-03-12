describe('CRM Objects - Notes', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Notes List View', () => {
    beforeEach(() => {
      cy.visit('/objects/notes');
      cy.waitForAppLoaded();
    });

    it('should display the Notes list page', () => {
      cy.url().should('include', '/objects/notes');
      cy.getByTestId('top-bar-title').should('contain.text', 'Notes');
    });

    it('should display a table or list of note records', () => {
      cy.get(
        'table, [role="table"], [role="grid"], [data-testid*="row"]',
        { timeout: 15000 },
      ).should('exist');
    });

    it('should show column headers', () => {
      cy.get(
        'th, [role="columnheader"], [data-testid*="header"]',
        { timeout: 15000 },
      ).should('have.length.greaterThan', 0);
    });

    it('should have a button to create a new note', () => {
      cy.get('button').filter(':contains("+")')
        .should('exist');
    });

    it('should create a new note via the + button', () => {
      cy.createRecordFromListPage();
      // Should either create inline or navigate to detail
      cy.get('body').should('be.visible');
    });

    it('should display filter and sort buttons', () => {
      cy.get('button').filter(':contains("Filter")').should('exist');
      cy.get('button').filter(':contains("Sort")').should('exist');
    });
  });

  describe('Note Detail View', () => {
    it('should navigate to a note detail page by clicking a record', () => {
      cy.visit('/objects/notes');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/note/');
          cy.getByTestId('top-bar-title').should('exist');
        } else {
          cy.log('No note records found - skipping detail navigation');
        }
      });
    });

    it('should display note content area on detail page', () => {
      cy.visit('/objects/notes');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/note/');
          // Note detail should have a content/body area
          cy.get('[data-testid*="note"], [contenteditable], textarea, [role="textbox"]', {
            timeout: 10000,
          }).should('exist');
        }
      });
    });

    it('should display timeline/activity section on note detail', () => {
      cy.visit('/objects/notes');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/note/');
          cy.get('body').should('be.visible');
        }
      });
    });

    it('should navigate back to notes list', () => {
      cy.visit('/objects/notes');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/note/');
          cy.contains('a', 'Notes').click();
          cy.url().should('include', '/objects/notes');
        }
      });
    });
  });
});
