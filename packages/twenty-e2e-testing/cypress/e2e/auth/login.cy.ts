describe('Authentication - Login', () => {
  beforeEach(() => {
    // Clear all sessions to test login from scratch
    Cypress.session.clearAllSavedSessions();
  });

  it('should display the login page at /welcome', () => {
    cy.visit('/welcome');
    cy.url().should('include', '/welcome');
    // The page should have an email input
    cy.get('input[name="email"], input[placeholder*="Email"], input[type="email"]')
      .should('exist')
      .and('be.visible');
  });

  it('should redirect unauthenticated users to /welcome', () => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit('/');
    cy.url({ timeout: 15000 }).should('include', '/welcome');
  });

  it('should show password field after entering email', () => {
    cy.visit('/welcome');

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Continue With Email")').length) {
        cy.contains('button', 'Continue With Email').click();
      }
    });

    cy.get('input[name="email"], input[placeholder*="Email"], input[type="email"]')
      .first()
      .clear()
      .type(Cypress.env('DEFAULT_LOGIN'));

    cy.contains('button', 'Continue').click();

    cy.get('input[type="password"]', { timeout: 10000 })
      .should('exist')
      .and('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/welcome');

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Continue With Email")').length) {
        cy.contains('button', 'Continue With Email').click();
      }
    });

    cy.get('input[name="email"], input[placeholder*="Email"], input[type="email"]')
      .first()
      .clear()
      .type('invalid@example.com');

    cy.contains('button', 'Continue').click();

    cy.get('input[type="password"]', { timeout: 10000 })
      .first()
      .clear()
      .type('wrongpassword123');

    cy.contains('button', 'Sign in').click();

    // Should stay on the login page or show an error
    cy.url({ timeout: 10000 }).should('satisfy', (url: string) => {
      return url.includes('/welcome') || url.includes('/verify');
    });
  });

  it('should successfully log in with valid credentials', () => {
    cy.visit('/welcome');

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Continue With Email")').length) {
        cy.contains('button', 'Continue With Email').click();
      }
    });

    cy.get('input[name="email"], input[placeholder*="Email"], input[type="email"]')
      .first()
      .clear()
      .type(Cypress.env('DEFAULT_LOGIN'));

    cy.contains('button', 'Continue').click();

    cy.get('input[type="password"]', { timeout: 10000 })
      .first()
      .clear()
      .type(Cypress.env('DEFAULT_PASSWORD'));

    cy.contains('button', 'Sign in').click();

    // Should navigate away from welcome page after login
    cy.url({ timeout: 20000 }).should('not.include', '/welcome');
  });

  it('should persist session across page reloads', () => {
    cy.login();
    cy.visit('/');
    cy.url({ timeout: 15000 }).should('not.include', '/welcome');

    // Reload and verify still logged in
    cy.reload();
    cy.url({ timeout: 15000 }).should('not.include', '/welcome');
  });
});
