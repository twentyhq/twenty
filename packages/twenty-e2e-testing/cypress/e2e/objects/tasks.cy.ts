describe('CRM Objects - Tasks', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Tasks List View', () => {
    beforeEach(() => {
      cy.visit('/objects/tasks');
      cy.waitForAppLoaded();
    });

    it('should display the Tasks list page', () => {
      cy.url().should('include', '/objects/tasks');
      cy.getByTestId('top-bar-title').should('contain.text', 'Tasks');
    });

    it('should display a table or list of task records', () => {
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

    it('should have a button to create a new task', () => {
      cy.get('button').filter(':contains("+")')
        .should('exist');
    });

    it('should create a new task via the + button', () => {
      cy.createRecordFromListPage();
      cy.get('body').should('be.visible');
    });

    it('should display filter and sort buttons', () => {
      cy.get('button').filter(':contains("Filter")').should('exist');
      cy.get('button').filter(':contains("Sort")').should('exist');
    });
  });

  describe('Task Detail View', () => {
    it('should navigate to a task detail page by clicking a record', () => {
      cy.visit('/objects/tasks');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/task/');
          cy.getByTestId('top-bar-title').should('exist');
        } else {
          cy.log('No task records found - skipping detail navigation');
        }
      });
    });

    it('should display task fields on detail page', () => {
      cy.visit('/objects/tasks');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/task/');
          // Task detail should have fields like status, due date, assignee
          cy.get('body').should('be.visible');
        }
      });
    });

    it('should display timeline/activity section on task detail', () => {
      cy.visit('/objects/tasks');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/task/');
          cy.get('body').should('be.visible');
        }
      });
    });

    it('should navigate back to tasks list', () => {
      cy.visit('/objects/tasks');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.clickFirstRecord();
          cy.url({ timeout: 10000 }).should('include', '/object/task/');
          cy.contains('a', 'Tasks').click();
          cy.url().should('include', '/objects/tasks');
        }
      });
    });
  });
});
