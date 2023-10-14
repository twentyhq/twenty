describe('My first test', () => {
	it('Visit twenty', () => {
		cy.visit('localhost:3001')
		cy.get('button[class="css-8bt555"]').click()
		cy.get('input[class="css-2amuc0"]').clear()
		cy.get('input[class="css-2amuc0"]').type('tim@apple.dev')
		cy.get('button[class="css-8bt555"]').click()
		cy.get('input[type="Password"]').clear()
		cy.get('input[type="Password"]').type('Applecar2025')
		cy.get('button[class="css-8bt555"]').click()
		//cy.get('button').should('have.value', 'Continue').click()
		//cy.get('button').should('have.value', 'Sign In').click()
	})
})
