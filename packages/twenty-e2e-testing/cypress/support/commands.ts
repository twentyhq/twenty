/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Log in via the UI with email and password.
     */
    login(email?: string, password?: string): Chainable<void>;

    /**
     * Log in by calling the backend API directly (faster, no UI interaction).
     */
    loginByApi(email?: string, password?: string): Chainable<void>;

    /**
     * Navigate to a specific CRM object list page.
     */
    navigateToObjectList(
      objectNamePlural: string,
    ): Chainable<void>;

    /**
     * Open the command menu (Ctrl+K / Cmd+K).
     */
    openCommandMenu(): Chainable<void>;

    /**
     * Wait for the app to be fully loaded after navigation.
     */
    waitForAppLoaded(): Chainable<void>;

    /**
     * Click a navigation item in the left sidebar by its label.
     */
    clickSidebarItem(label: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get an element by its data-testid attribute.
     */
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add(
  'login',
  (
    email = Cypress.env('DEFAULT_LOGIN'),
    password = Cypress.env('DEFAULT_PASSWORD'),
  ) => {
    cy.session(
      [email, password],
      () => {
        cy.visit('/welcome');
        cy.url().then((url) => {
          // If redirected to the app, already logged in
          if (!url.includes('welcome') && !url.includes('verify')) {
            return;
          }

          // Click "Login with Email" if present (for hosted deployments)
          cy.get('body').then(($body) => {
            if ($body.find('button:contains("Continue With Email")').length) {
              cy.contains('button', 'Continue With Email').click();
            }
          });

          // Enter email
          cy.get('input[name="email"], input[placeholder*="Email"], input[type="email"]')
            .first()
            .clear()
            .type(email);

          cy.contains('button', 'Continue').click();

          // Enter password
          cy.get('input[type="password"]', { timeout: 10000 })
            .first()
            .clear()
            .type(password);

          cy.contains('button', 'Sign in').click();

          // Wait until we reach the app
          cy.url({ timeout: 20000 }).should('not.include', '/welcome');
        });
      },
      {
        validate() {
          // Validate the session is still valid by checking we can reach the app
          cy.visit('/');
          cy.url({ timeout: 15000 }).should('not.include', '/welcome');
        },
      },
    );
  },
);

Cypress.Commands.add(
  'loginByApi',
  (
    email = Cypress.env('DEFAULT_LOGIN'),
    password = Cypress.env('DEFAULT_PASSWORD'),
  ) => {
    cy.session(
      ['api', email, password],
      () => {
        const backendUrl = Cypress.env('BACKEND_BASE_URL');
        cy.request({
          method: 'POST',
          url: `${backendUrl}/graphql`,
          body: {
            operationName: 'SignIn',
            variables: { email, password },
            query: `
              mutation SignIn($email: String!, $password: String!) {
                signIn(email: $email, password: $password) {
                  loginToken {
                    token
                    expiresAt
                  }
                }
              }
            `,
          },
        }).then((response) => {
          const loginToken =
            response.body.data?.signIn?.loginToken?.token;
          if (loginToken) {
            // Visit the verify page with the login token to establish session
            cy.visit(`/verify?loginToken=${loginToken}`);
            cy.url({ timeout: 20000 }).should('not.include', '/verify');
          }
        });
      },
      {
        validate() {
          cy.visit('/');
          cy.url({ timeout: 15000 }).should('not.include', '/welcome');
        },
      },
    );
  },
);

Cypress.Commands.add('navigateToObjectList', (objectNamePlural: string) => {
  cy.visit(`/objects/${objectNamePlural}`);
  cy.waitForAppLoaded();
});

Cypress.Commands.add('openCommandMenu', () => {
  cy.get('body').type('{ctrl}k');
});

Cypress.Commands.add('waitForAppLoaded', () => {
  // Wait for the main content area to be present and loading indicators to disappear
  cy.get('[data-testid="top-bar-title"], nav, [role="navigation"]', {
    timeout: 15000,
  }).should('exist');
  // Give the app a moment to settle after initial render
  cy.wait(500);
});

Cypress.Commands.add('clickSidebarItem', (label: string) => {
  return cy.get('nav, [role="navigation"]')
    .first()
    .find(`a, button, [role="link"]`)
    .filter(`:contains("${label}")`)
    .first()
    .click();
});
