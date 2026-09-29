import { expect, test } from '../lib/fixtures/screenshot';
import { postBackendGraphQL } from '../lib/requests/post-backend-graphql';

type FindOnePersonData = {
  person: {
    name: { firstName: string; lastName: string };
    emails: { primaryEmail: string };
    intro: string;
    linkedinLink: { primaryLinkUrl: string };
    phones: { primaryPhoneNumber: string };
    workPreference: string[];
  };
};

const query = `query FindOnePerson($objectRecordId: UUID!) {
  person(
    filter: {or: [{deletedAt: {is: NULL}}, {deletedAt: {is: NOT_NULL}}], id: {eq: $objectRecordId}}
  ) {
    previousCompanies {
      edges {
        node {
          company {
            name
          }
        }
      }
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
      secondaryLinks {
        label
        url
      }
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
      additionalPhones {
        number
        callingCode
        countryCode
      }
      __typename
    }
    position
    workPreference
    updatedAt
  }
}`;

test('Create and update record', async ({ page }) => {
  await page.goto('/objects/people');
  await page.getByRole('button', { name: 'Create Person' }).click();

  // Generate a random email for testing
  const randomEmail = `testuser_${Math.random().toString(36).substring(2, 10)}@example.com`;

  // Fill the record creation form in the side panel
  const firstNameInput = page.locator('[contenteditable]').filter({
    has: page.locator('p[data-placeholder="F‌‌irst name"]'),
  });
  await expect(firstNameInput).toBeVisible();
  await firstNameInput.click();
  await expect(firstNameInput).toBeFocused();
  await page.keyboard.type('John');

  const lastNameInput = page.locator('[contenteditable]').filter({
    has: page.locator('p[data-placeholder="L‌‌ast name"]'),
  });
  await lastNameInput.click();
  await expect(lastNameInput).toBeFocused();
  await page.keyboard.type('Doe');

  const emailInput = page.locator('[contenteditable]').filter({
    has: page.locator('p[data-placeholder="Primary Email"]'),
  });
  await emailInput.click();
  await expect(emailInput).toBeFocused();
  await page.keyboard.type(randomEmail);

  await page.getByTestId('record-creation-form-create-button').click();

  // The created record opens in the side panel
  const recordFieldList = page.getByTestId('record-fields-widget');
  await expect(recordFieldList).toBeVisible({ timeout: 15_000 });
  await expect(recordFieldList.getByText(randomEmail)).toBeVisible({
    timeout: 15_000,
  });

  // Fill intro
  const introInput = recordFieldList.getByText('Intro', { exact: true }).nth(1);
  await expect(introInput).toBeVisible();
  await introInput.click({ force: true });
  await introInput.click({ force: true });
  await page.getByPlaceholder('Intro').fill('This is an intro');
  await page.getByPlaceholder('Intro').press('Enter');

  // Fill URL
  await recordFieldList.getByText('Linkedin', { exact: true }).first().click();
  const urlInput = recordFieldList.getByText('Linkedin', { exact: true }).nth(1);
  await expect(urlInput).toBeVisible();
  await urlInput.click({ force: true });
  await page.getByPlaceholder('URL').fill('linkedin.com/johndoe');
  await page.getByPlaceholder('URL').press('Enter');

  // Click on 4th star to rate
  await recordFieldList
    .getByText('Performance Rating', { exact: true })
    .first()
    .click({ force: true });
  const ratingContainer = recordFieldList.locator('div[aria-label="Rating"]');
  await ratingContainer.locator('svg').nth(3).click({ force: true });

  // Fill phone field
  await recordFieldList.getByText('Phones', { exact: true }).first().click();
  const phoneInput = recordFieldList.getByText('Phones', { exact: true }).nth(1);
  await expect(phoneInput).toBeVisible();
  await phoneInput.click({ force: true });
  await page.getByPlaceholder('Phone').fill('+336 1 122 3344');
  await page.getByPlaceholder('Phone').press('Enter');

  // Fill work preference
  await recordFieldList
    .getByText('Work Preference', { exact: true })
    .first()
    .click({ force: true });
  await recordFieldList
    .getByText('Work Preference', { exact: true })
    .nth(1)
    .click({ force: true });
  const options = page.getByRole('listbox');
  await options.getByText('Hybrid').first().click({ force: true });
  await recordFieldList
    .getByText('Work Preference', { exact: true })
    .first()
    .click({ force: true });

  // Open full record page to get person ID
  await page.getByRole('button', { name: 'Expand record' }).click();
  await page.waitForURL(/\/object\/person\//);
  const newPersonId = page.url().match(/\/object\/person\/([a-f0-9-]+)/)?.[1];

  // Check data was saved
  const findOnePersonResponse = await postBackendGraphQL<FindOnePersonData>({
    page,
    data: {
      operationName: 'FindOnePerson',
      query,
      variables: {
        objectRecordId: newPersonId,
      },
    },
  });

  expect(findOnePersonResponse.status).toBe(200);
  expect(findOnePersonResponse.body.errors).toBeUndefined();
  expect(findOnePersonResponse.body.data?.person).toMatchObject({
    name: { firstName: 'John', lastName: 'Doe' },
    emails: { primaryEmail: randomEmail },
    intro: 'This is an intro',
    linkedinLink: { primaryLinkUrl: 'linkedin.com/johndoe' },
    phones: { primaryPhoneNumber: '611223344' },
    workPreference: ['HYBRID'],
  });
});
