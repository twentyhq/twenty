describe('Authentication - Password Reset', () => {
  it('should display the password reset page', () => {
    cy.visit('/reset-password/test-token');
    // The page should render (even if token is invalid, the form should appear)
    cy.get('body').should('be.visible');
  });

  it('should have password input fields on reset page', () => {
    cy.visit('/reset-password/test-token');
    // There should be at least one password input for entering the new password
    cy.get('input[type="password"]', { timeout: 10000 }).should('exist');
  });
});
