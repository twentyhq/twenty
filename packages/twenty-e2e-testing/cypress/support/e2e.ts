import './commands';

// Hide fetch/XHR requests from command log to reduce noise
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Prevent uncaught exceptions from failing the test
Cypress.on('uncaught:exception', () => {
  return false;
});

// Intercept GraphQL requests and provide aliases for common operations
beforeEach(() => {
  cy.intercept('POST', '**/graphql', (req) => {
    const operationName = req.body?.operationName;
    if (operationName) {
      req.alias = `gql${operationName}`;
    }
  });
});

// Log test name before each test for easier debugging
beforeEach(function () {
  const testTitle = this.currentTest?.fullTitle();
  if (testTitle) {
    Cypress.log({
      name: 'TEST',
      displayName: 'TEST',
      message: testTitle,
    });
  }
});
