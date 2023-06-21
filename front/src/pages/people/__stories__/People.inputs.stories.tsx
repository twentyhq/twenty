import { getOperationName } from '@apollo/client/utilities';
import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { UPDATE_PERSON } from '@/people/services';
import { SEARCH_COMPANY_QUERY } from '@/search/services/search';
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

    const firstRowEmailCell = await canvas.findByText(
      mockedPeopleData[0].email,
    );

    const secondRowEmailCell = await canvas.findByText(
      mockedPeopleData[1].email,
    );

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(firstRowEmailCell);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeInTheDocument();

    await userEvent.click(secondRowEmailCell);

    await sleep(25);

    expect(
      canvas.queryByTestId('editable-cell-edit-mode-container'),
    ).toBeNull();

    await userEvent.click(secondRowEmailCell);

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

export const EditRelation: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const secondRowCompanyCell = await canvas.findByText(
      mockedPeopleData[1].company.name,
    );

    await userEvent.click(secondRowCompanyCell);

    const relationInput = await canvas.findByPlaceholderText('Search');

    await userEvent.type(relationInput, 'Air', {
      delay: 200,
    });

    const airbnbChip = await canvas.findByText('Airbnb', {
      selector: 'div > span',
    });

    await userEvent.click(airbnbChip);

    const newSecondRowCompanyCell = await canvas.findByText('Airbnb');

    await userEvent.click(newSecondRowCompanyCell);
  },
  parameters: {
    actions: {},
    msw: [
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
        graphql.mutation(
          getOperationName(UPDATE_PERSON) ?? '',
          (req, res, ctx) => {
            return res(
              ctx.data({
                updateOnePerson: {
                  ...fetchOneFromData(mockedPeopleData, req.variables.id),
                  ...{
                    company: {
                      id: req.variables.companyId,
                      name: 'Airbnb',
                      domainName: 'airbnb.com',
                      __typename: 'Company',
                    },
                  },
                },
              }),
            );
          },
        ),
        graphql.query(
          getOperationName(SEARCH_COMPANY_QUERY) ?? '',
          (req, res, ctx) => {
            let searchResults = mockedCompaniesData.filter((company) =>
              ['Airbnb', 'Aircall'].includes(company.name),
            );

            req.variables.where?.AND?.forEach(
              (where: { id: { notIn: string } }) => {
                if (where.id?.notIn) {
                  console.log(where.id?.notIn);
                  searchResults = searchResults.filter(
                    (company) => company.id !== where.id.notIn,
                  );
                }
              },
            );
            return res(
              ctx.data({
                searchResults: searchResults,
              }),
            );
          },
        ),
      ],
    ],
  },
};

export const SelectRelationWithKeys: Story = {
  render: getRenderWrapperForPage(<People />, '/people'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const thirdRowCompanyCell = await canvas.findByText(
      mockedPeopleData[2].company.name,
    );

    await userEvent.click(thirdRowCompanyCell);

    const relationInput = await canvas.findByPlaceholderText('Company');

    await userEvent.type(relationInput, 'Air', {
      delay: 200,
    });

    await userEvent.type(relationInput, '{arrowdown}');
    await userEvent.type(relationInput, '{arrowdown}');
    await userEvent.type(relationInput, '{arrowup}');
    await userEvent.type(relationInput, '{arrowdown}');
    await userEvent.type(relationInput, '{enter}');

    const newThirdRowCompanyCell = await canvas.findByText('Aircall');
    await userEvent.click(newThirdRowCompanyCell);
  },
  parameters: {
    actions: {},
    msw: [
      ...graphqlMocks.filter((graphqlMock) => {
        return graphqlMock.info.operationName !== 'UpdatePeople';
      }),
      ...[
        graphql.mutation('UpdatePeople', (req, res, ctx) => {
          return res(
            ctx.data({
              updateOnePerson: {
                ...fetchOneFromData(mockedPeopleData, req.variables.id),
                ...{
                  company: {
                    id: req.variables.companyId,
                    name: 'Aircall',
                    domainName: 'aircall.io',
                    __typename: 'Company',
                  },
                },
              },
            }),
          );
        }),
      ],
    ],
  },
};
