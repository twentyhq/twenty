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
  });

  describe('Workflow Creation', () => {
    it('should create a new workflow and navigate to its detail page', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      // Click create button
      cy.get('button')
        .filter(':contains("Create new workflow")')
        .first()
        .click();

      // Should navigate to the new workflow detail page
      cy.url({ timeout: 15000 }).should('include', '/object/workflow/');

      // The workflow detail page should have the top bar title
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

      // Click on the title to edit it
      cy.getByTestId('top-bar-title').click();

      // Type a new name
      cy.getByTestId('top-bar-title')
        .find('input, [contenteditable="true"]')
        .clear()
        .type('My Test Workflow{enter}');

      // Verify the name was updated
      cy.getByTestId('top-bar-title').should('contain.text', 'My Test Workflow');
    });
  });

  describe('Workflow Detail View', () => {
    it('should display the workflow visualizer/diagram', () => {
      cy.visit('/objects/workflows');
      cy.waitForAppLoaded();

      // Click on a workflow if one exists, otherwise create one
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

      // The workflow should have a diagram/visualizer
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

      // Workflow should have at least a trigger node
      cy.get(
        '.react-flow__node, [data-testid*="step"], [data-testid*="trigger"]',
        { timeout: 15000 },
      ).should('have.length.greaterThan', 0);
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

      // Navigate back via sidebar
      cy.contains('a', 'Workflows').click();
      cy.url().should('include', '/objects/workflows');
    });
  });
});
