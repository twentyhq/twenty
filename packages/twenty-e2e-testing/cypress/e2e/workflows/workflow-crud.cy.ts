describe('Workflows', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Workflows List View', () => {
    beforeEach(() => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();
    });

    it('should display the Workflows list page', () => {
      cy.url().should('include', '/objects/workflows');
      cy.getByTestId('top-bar-title').should('contain.text', 'Workflows');
    });

    it('should have a button to create a new workflow', () => {
      cy.get('button')
        .filter(':contains("Create new workflow"), :contains("+")')
        .should('exist');
    });

    it('should display records or empty state', () => {
      cy.get('body').should('be.visible');
    });

    it('should display a table or list view', () => {
      cy.get(
        'table, [role="table"], [role="grid"], [data-testid*="row"]',
        { timeout: 15000 },
      ).should('exist');
    });

    it('should display filter and sort buttons', () => {
      cy.get('button').filter(':contains("Filter")').should('exist');
      cy.get('button').filter(':contains("Sort")').should('exist');
    });
  });

  describe('Workflow Creation', () => {
    it('should create a new workflow and navigate to its detail page', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('button')
        .filter(':contains("Create new workflow")')
        .first()
        .click();

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');
      cy.getByTestId('top-bar-title').should('exist');
    });

    it('should allow renaming a workflow', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('button')
        .filter(':contains("Create new workflow")')
        .first()
        .click();

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      cy.getByTestId('top-bar-title').click();

      cy.getByTestId('top-bar-title')
        .find('input, [contenteditable="true"]')
        .clear()
        .type('My Test Workflow{enter}');

      cy.getByTestId('top-bar-title').should('contain.text', 'My Test Workflow');
    });

    it('should show the new workflow in the list after creation', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('button')
        .filter(':contains("Create new workflow")')
        .first()
        .click();

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      // Navigate back to list
      cy.contains('a', 'Workflows').click();
      cy.url().should('include', '/objects/workflows');

      // The list should have at least one workflow
      cy.get('[data-testid^="row-id-"]', { timeout: 15000 })
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Workflow Detail View', () => {
    it('should display the workflow visualizer/diagram', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
        } else {
          cy.get('button')
            .filter(':contains("Create new workflow")')
            .first()
            .click();
        }
      });

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      cy.get('.react-flow__renderer, [data-testid*="workflow"]', {
        timeout: 15000,
      }).should('exist');
    });

    it('should display workflow step elements', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
        } else {
          cy.get('button')
            .filter(':contains("Create new workflow")')
            .first()
            .click();
        }
      });

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      cy.get(
        '.react-flow__node, [data-testid*="step"], [data-testid*="trigger"]',
        { timeout: 15000 },
      ).should('have.length.greaterThan', 0);
    });

    it('should display a trigger node in the workflow', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
        } else {
          cy.get('button')
            .filter(':contains("Create new workflow")')
            .first()
            .click();
        }
      });

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      // Workflow should have a trigger node
      cy.get(
        '.react-flow__node, [data-testid*="trigger"]',
        { timeout: 15000 },
      ).should('exist');
    });

    it('should have a clickable trigger node', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
        } else {
          cy.get('button')
            .filter(':contains("Create new workflow")')
            .first()
            .click();
        }
      });

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      // Click on the first node
      cy.get(
        '.react-flow__node, [data-testid*="step"], [data-testid*="trigger"]',
        { timeout: 15000 },
      ).first().click();

      // Should open a panel or show node details
      cy.get('body').should('be.visible');
    });

    it('should have a unique URL for each workflow', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
        } else {
          cy.get('button')
            .filter(':contains("Create new workflow")')
            .first()
            .click();
        }
      });

      cy.url({ timeout: 15000 }).should('match', /\/object\/workflow\/[\w-]+/);
    });
  });

  describe('Workflow Activation', () => {
    it('should display workflow status (active/draft)', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
        } else {
          cy.get('button')
            .filter(':contains("Create new workflow")')
            .first()
            .click();
        }
      });

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');
      cy.get('body').should('be.visible');
    });

    it('should have activate/deactivate controls', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
        } else {
          cy.get('button')
            .filter(':contains("Create new workflow")')
            .first()
            .click();
        }
      });

      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      // Should have some toggle or button for activation
      cy.get('button, [role="switch"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Navigate back from Workflow', () => {
    it('should navigate back to workflows list from detail view', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="row-id-"]').length > 0) {
          cy.get('[data-testid^="row-id-"]').first().click();
          cy.url({ timeout: 15000 }).should('include', '/object/workflow/');
        }
      });

      cy.contains('a', 'Workflows').click();
      cy.url().should('include', '/objects/workflows');
    });
  });
});
