import { getOperationName } from '@apollo/client/utilities';
import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { UPDATE_PERSON } from '@/people/services';
import { SEARCH_COMPANY_QUERY } from '@/search/services/search';
import { Company } from '~/generated/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { fetchOneFromData } from '~/testing/mock-data';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';
import { sleep } from '~/testing/sleep';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<typeof People> = {
  title: 'Pages/People/Input',
  component: People,
};

export default meta;

export const InteractWithManyRows: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    let firstRowEmailCell = await canvas.findByText(mockedPeopleData[0].email);

    let secondRowEmailCell = await canvas.findByText(mockedPeopleData[1].email);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(firstRowEmailCell);

    await sleep(100);
    firstRowEmailCell = await canvas.findByText(mockedPeopleData[0].email);
    await userEvent.click(firstRowEmailCell);
    await sleep(100);
    firstRowEmailCell = await canvas.findByText(mockedPeopleData[0].email);
    await userEvent.click(firstRowEmailCell);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeInTheDocument();

    secondRowEmailCell = await canvas.findByText(mockedPeopleData[1].email);
    await userEvent.click(secondRowEmailCell);

    await sleep(25);

    const secondRowEmailCellFocused = await canvas.findByText(
      mockedPeopleData[1].email,
    );

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(secondRowEmailCellFocused);

    await sleep(25);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeInTheDocument();
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export const CheckCheckboxes: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(mockedPeopleData[0].email);

    const inputCheckboxContainers = await canvas.findAllByTestId(
      'input-checkbox-cell-container',
    );

    const inputCheckboxes = await canvas.findAllByTestId('input-checkbox');

    const secondCheckboxContainer = inputCheckboxContainers[1];
    const secondCheckbox = inputCheckboxes[1] as HTMLInputElement;

    expect(secondCheckboxContainer).toBeDefined();

    await userEvent.click(secondCheckboxContainer);

    expect(secondCheckbox.checked).toBe(true);

    await userEvent.click(secondCheckbox);

    expect(secondCheckbox.checked).toBe(false);
  },
  parameters: {
    msw: graphqlMocks,
  },
};

const editRelationMocks = (
  initiallySelectedCompanyName: string,
  searchCompanyNames: Array<string>,
  updateSelectedCompany: Pick<Company, 'name' | 'domainName'>,
) => [
  ...graphqlMocks.filter((graphqlMock) => {
    if (
      typeof graphqlMock.info.operationName === 'string' &&
      [
        getOperationName(UPDATE_PERSON),
        getOperationName(SEARCH_COMPANY_QUERY),
      ].includes(graphqlMock.info.operationName)
    ) {
      return false;
    }
    return true;
  }),
  ...[
    graphql.mutation(getOperationName(UPDATE_PERSON) ?? '', (req, res, ctx) => {
      return res(
        ctx.data({
          updateOnePerson: {
            ...fetchOneFromData(mockedPeopleData, req.variables.id),
            ...{
              company: {
                id: req.variables.companyId,
                name: updateSelectedCompany.name,
                domainName: updateSelectedCompany.domainName,
                __typename: 'Company',
              },
            },
          },
        }),
      );
    }),
    graphql.query(
      getOperationName(SEARCH_COMPANY_QUERY) ?? '',
      (req, res, ctx) => {
        if (!req.variables.where?.AND) {
          // Selected company case
          const searchResults = mockedCompaniesData.filter((company) =>
            [initiallySelectedCompanyName].includes(company.name),
          );
          return res(
            ctx.data({
              searchResults: searchResults,
            }),
          );
        }

        if (
          req.variables.where?.AND?.some(
            (where: { id?: { in: Array<string> } }) => where.id?.in,
          )
        ) {
          // Selected company case
          const searchResults = mockedCompaniesData.filter((company) =>
            [initiallySelectedCompanyName].includes(company.name),
          );
          return res(
            ctx.data({
              searchResults: searchResults,
            }),
          );
        } else {
          // Search case

          const searchResults = mockedCompaniesData.filter((company) =>
            searchCompanyNames.includes(company.name),
          );
          return res(
            ctx.data({
              searchResults: searchResults,
            }),
          );
        }
      },
    ),
  ],
];

export const EditRelation: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    let secondRowCompanyCell = await canvas.findByText(
      mockedPeopleData[1].company.name,
    );
    await sleep(25);

    await userEvent.click(secondRowCompanyCell);

    secondRowCompanyCell = await canvas.findByText(
      mockedPeopleData[1].company.name,
    );
    await sleep(25);

    await userEvent.click(secondRowCompanyCell);

    const relationInput = await canvas.findByPlaceholderText('Search');

    await userEvent.type(relationInput, 'Air', {
      delay: 200,
    });

    const airbnbChip = await canvas.findByText('Airbnb', {
      selector: 'div',
    });

    await userEvent.click(airbnbChip);

    const otherCell = await canvas.findByText('Janice Dane');
    await userEvent.click(otherCell);

    await canvas.findByText('Airbnb');
  },
  parameters: {
    actions: {},
    msw: editRelationMocks('Qonto', ['Airbnb', 'Aircall'], {
      name: 'Airbnb',
      domainName: 'airbnb.com',
    }),
  },
};

export const SelectRelationWithKeys: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    let firstRowCompanyCell = await canvas.findByText(
      mockedPeopleData[0].company.name,
    );
    await sleep(25);

    await userEvent.click(firstRowCompanyCell);
    firstRowCompanyCell = await canvas.findByText(
      mockedPeopleData[0].company.name,
    );
    await sleep(25);
    await userEvent.click(firstRowCompanyCell);

    const relationInput = await canvas.findByPlaceholderText('Search');

    await userEvent.type(relationInput, 'Air', {
      delay: 200,
    });

    await userEvent.type(relationInput, '{arrowdown}');
    await userEvent.type(relationInput, '{arrowup}');
    await userEvent.type(relationInput, '{arrowdown}');
    await userEvent.type(relationInput, '{arrowdown}');
    await userEvent.type(relationInput, '{enter}');
    sleep(25);

    const allAirbns = await canvas.findAllByText('Aircall');
    expect(allAirbns.length).toBe(1);
  },
  parameters: {
    actions: {},
    msw: editRelationMocks('Qonto', ['Airbnb', 'Aircall'], {
      name: 'Aircall',
      domainName: 'aircall.io',
    }),
  },
};
