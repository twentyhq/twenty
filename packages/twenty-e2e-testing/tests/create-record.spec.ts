import { expect, test } from '../lib/fixtures/screenshot';
import { backendGraphQLUrl } from '../lib/requests/backend';
import { getAccessAuthToken } from '../lib/utils/getAccessAuthToken';

const query = `query FindOnePerson($objectRecordId: UUID!) {
  person(
    filter: {or: [{deletedAt: {is: NULL}}, {deletedAt: {is: NOT_NULL}}], id: {eq: $objectRecordId}}
  ) {
    company {
      name
    }
    emails {
      primaryEmail
      additionalEmails
      __typename
    }
    id
    intro
    jobTitle
    linkedinLink {
      primaryLinkUrl
      primaryLinkLabel
      secondaryLinks
      __typename
    }
    name {
      firstName
      lastName
      __typename
    }
    performanceRating
    phones {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
      additionalPhones
      __typename
    }
    position
    workPreference
    updatedAt
  }
}`

test('Create and update record', async ({ page }) => {
    await page.getByRole('link', { name: 'People' }).click();
    await page.getByRole('button', { name: 'Create new record' }).click();

    // Generate a random email for testing
    const randomEmail = `testuser_${Math.random().toString(36).substring(2, 10)}@example.com`;
    // Fill first name and last name
    const firstNameInput = page.getByRole('textbox', { name: 'F‌‌irst name' })
    await expect(firstNameInput).toBeFocused();
    await firstNameInput.fill('John');
    const lastNameInput = page.getByPlaceholder('L‌‌ast name');
    await expect(lastNameInput).toBeVisible();
    await lastNameInput.fill('Doe');
    await lastNameInput.press('Enter');

    // Focus on recordFieldList
    const recordFieldList = page.getByTestId('record-fields-list-container');
    await expect(recordFieldList).toBeVisible();
    await recordFieldList.getByText('Emails').first().click();

    // Fill email
    const emailInput = recordFieldList.getByText('Emails').nth(1);
    await expect(emailInput).toBeVisible();
    await emailInput.click({ force: true });
    await page.getByPlaceholder('Email').fill(randomEmail);
    await page.keyboard.press('Enter');
    await recordFieldList.getByText('Emails').first().click();


    // Fill intro
    const introInput = recordFieldList.getByText('Intro').nth(1);
    await expect(introInput).toBeVisible();
    await introInput.click({ force: true });
    await introInput.click({ force: true });
    await page.getByPlaceholder('Intro').fill('This is an intro');
    await page.getByPlaceholder('Intro').press('Enter');

    // Fill URL
    const urlInput = recordFieldList.getByText('Linkedin').nth(1);
    await expect(urlInput).toBeVisible();
    await urlInput.click({ force: true });
    await page.getByPlaceholder('URL').fill('linkedin.com/johndoe');
    await page.getByPlaceholder('URL').press('Enter');

    // Click on 4th star to rate
    recordFieldList.getByText('Performance Rating').first().click({ force: true });
    const ratingContainer = recordFieldList.locator('div[aria-label="Rating"]');
    await ratingContainer.locator('svg').nth(3).click({force: true});

    // Fill phone field
    const phoneInput = recordFieldList.getByText('Phones').nth(1);
    await expect(phoneInput).toBeVisible();
    await phoneInput.click({ force: true });
    await page.getByPlaceholder('Phone').fill('+336 1 122 3344');
    await page.getByPlaceholder('Phone').press('Enter');

    // Fill work preference
    await recordFieldList.getByText('Work Preference').first().click({force: true});
    await recordFieldList.getByText('Work Preference').nth(1).click({force: true});
    const options = page.getByRole('listbox');
    await options.getByText('Hybrid').first().click({force: true});
    recordFieldList.getByText('Work Preference').first().click({force: true});

    // Fill company relation
    const companyRelationHeader = page.getByTestId('company-relation');
    await expect(companyRelationHeader).toBeVisible();

    await companyRelationHeader.locator('.tabler-icon-pencil').click();
    await page.getByRole('textbox', { name: 'Search' }).fill('Goog');
    await expect(page.getByRole('option', { name: 'Google' })).toBeVisible();
    const [updatePersonResponse] = await Promise.all([
      page.waitForResponse(async (response) => {
        if (!response.url().endsWith('/graphql')) {
          return false;
        }

        const requestBody = response.request().postDataJSON();

        return requestBody.operationName === 'UpdateOnePerson';
      }),
      await page.getByRole('option', { name: 'Google' }).click({force: true})
    ]);

    const body = await updatePersonResponse.json()
    const newPersonId = body.data.updatePerson.id;

    // Check data was saved
    const { authToken } = await getAccessAuthToken(page);
    const findOnePersonResponse = await page.request.post(backendGraphQLUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'FindOnePerson',
        query,
        variables: {
          objectRecordId: newPersonId,
        }
      },
    });

    const findOnePersonReponseBody = await findOnePersonResponse.json();

    expect(findOnePersonReponseBody.data.person.name.firstName).toBe('John');
    expect(findOnePersonReponseBody.data.person.name.lastName).toBe('Doe');
    expect(findOnePersonReponseBody.data.person.emails.primaryEmail).toBe(randomEmail);
    expect(findOnePersonReponseBody.data.person.intro).toBe('This is an intro');
    expect(findOnePersonReponseBody.data.person.linkedinLink.primaryLinkUrl).toBe('linkedin.com/johndoe');
    expect(findOnePersonReponseBody.data.person.phones.primaryPhoneNumber).toBe('611223344');
    expect(findOnePersonReponseBody.data.person.workPreference).toEqual(['HYBRID']);
    expect(findOnePersonReponseBody.data.person.company.name).toBe('Google');

});
