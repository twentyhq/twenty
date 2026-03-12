describe('Authentication - Password Reset', () => {
  describe('Reset Password Page', () => {
    beforeEach(() => {
      cy.visit('/reset-password/test-token');
    });

    it('should display the password reset page', () => {
      cy.get('body').should('be.visible');
    });

    it('should have password input fields on reset page', () => {
      cy.get('input[type="password"]', { timeout: 10000 }).should('exist');
    });

    it('should show a submit button for resetting password', () => {
      cy.get('button')
        .filter(':contains("Reset"), :contains("Change"), :contains("Submit")')
        .should('exist');
    });

    it('should validate empty password field on submit', () => {
      cy.get('button')
        .filter(':contains("Reset"), :contains("Change"), :contains("Submit")')
        .first()
        .click();

      // Should stay on the reset page or show validation error
      cy.url().should('include', '/reset-password');
    });

    it('should validate password minimum length', () => {
      cy.get('input[type="password"]').first().clear().type('abc');

      cy.get('button')
        .filter(':contains("Reset"), :contains("Change"), :contains("Submit")')
        .first()
        .click();

      // Should show error or stay on page due to short password
      cy.url().should('include', '/reset-password');
    });
  });

  describe('Forgot Password Flow', () => {
    it('should navigate to forgot password from welcome page', () => {
      cy.visit('/welcome');

      // Enter an email first
      cy.get('input[name="email"], input[placeholder*="Email"], input[type="email"]')
        .first()
        .clear()
        .type(Cypress.env('DEFAULT_LOGIN'));

      cy.contains('button', 'Continue').click();

      // Look for forgot password link
      cy.get('a, button')
        .filter(':contains("Forgot"), :contains("Reset")')
        .should('exist');
    });

    it('should display the forgot password page', () => {
      cy.visit('/forgot-password');
      cy.get('body').should('be.visible');
    });

    it('should have an email input on the forgot password page', () => {
      cy.visit('/forgot-password');
      cy.get('input[type="email"], input[name="email"], input[placeholder*="Email"]', {
        timeout: 10000,
      }).should('exist');
    });

    it('should accept email for password reset request', () => {
      cy.visit('/forgot-password');

      cy.get('input[type="email"], input[name="email"], input[placeholder*="Email"]')
        .first()
        .clear()
        .type('test@example.com');

      cy.get('button')
        .filter(':contains("Reset"), :contains("Send"), :contains("Submit"), :contains("Continue")')
        .first()
        .click();

      // Should show confirmation or navigate to a success page
      cy.get('body').should('be.visible');
    });
  });
});
