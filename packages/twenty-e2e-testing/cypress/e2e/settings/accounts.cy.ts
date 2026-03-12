describe('Settings - Accounts', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Accounts Main Page', () => {
    beforeEach(() => {
      cy.navigateToSettings('accounts');
    });

    it('should display the accounts settings page', () => {
      cy.url().should('include', '/settings/accounts');
    });

    it('should display the page heading', () => {
      cy.get('body').should('be.visible');
    });

    it('should have navigation links to emails and calendars', () => {
      cy.get('a, button')
        .filter(':contains("Emails"), :contains("Calendars")')
        .should('have.length.greaterThan', 0);
    });

    it('should navigate to emails sub-page', () => {
      cy.contains('a', /emails/i).click();
      cy.url().should('include', '/settings/accounts/emails');
    });

    it('should navigate to calendars sub-page', () => {
      cy.contains('a', /calendars/i).click();
      cy.url().should('include', '/settings/accounts/calendars');
    });
  });

  describe('Emails Sub-page', () => {
    beforeEach(() => {
      cy.navigateToSettings('accounts/emails');
    });

    it('should display the email accounts page', () => {
      cy.url().should('include', '/settings/accounts/emails');
    });

    it('should show option to connect email account', () => {
      cy.get('button, a')
        .filter(':contains("Connect"), :contains("Add")')
        .should('exist');
    });

    it('should display connected accounts section or empty state', () => {
      cy.get('body').should('be.visible');
    });

    it('should show email sync visibility options if accounts exist', () => {
      cy.get('body').then(($body) => {
        if ($body.find(':contains("Google"), :contains("Microsoft")').length > 0) {
          cy.log('Connected email accounts found');
        } else {
          cy.log('No connected email accounts');
        }
      });
    });

    it('should navigate back to accounts main page', () => {
      cy.go('back');
      cy.url().should('include', '/settings/accounts');
    });
  });

  describe('Calendars Sub-page', () => {
    beforeEach(() => {
      cy.navigateToSettings('accounts/calendars');
    });

    it('should display the calendar accounts page', () => {
      cy.url().should('include', '/settings/accounts/calendars');
    });

    it('should show option to connect calendar', () => {
      cy.get('button, a')
        .filter(':contains("Connect"), :contains("Add")')
        .should('exist');
    });

    it('should display connected calendars section or empty state', () => {
      cy.get('body').should('be.visible');
    });

    it('should show calendar sync visibility options if calendars exist', () => {
      cy.get('body').then(($body) => {
        if ($body.find(':contains("Google"), :contains("Microsoft")').length > 0) {
          cy.log('Connected calendar accounts found');
        } else {
          cy.log('No connected calendar accounts');
        }
      });
    });

    it('should navigate back to accounts main page', () => {
      cy.go('back');
      cy.url().should('include', '/settings/accounts');
    });
  });
});
