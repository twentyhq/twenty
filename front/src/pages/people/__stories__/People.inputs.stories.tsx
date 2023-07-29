import { getOperationName } from '@apollo/client/utilities';
import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { UPDATE_ONE_PERSON } from '@/people/queries';
import { SEARCH_COMPANY_QUERY } from '@/search/queries/search';
import { Company } from '~/generated/graphql';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { fetchOneFromData } from '~/testing/mock-data';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { sleep } from '~/testing/sleep';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/People/Input',
  component: People,
  decorators: [PageDecorator],
  args: { currentPath: '/people' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export const InteractWithManyRows: Story = {
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
};

export const CheckCheckboxes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(mockedPeopleData[0].email);

    const inputCheckboxContainers = await canvas.findAllByTestId(
      'input-checkbox',
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
        getOperationName(UPDATE_ONE_PERSON),
        getOperationName(SEARCH_COMPANY_QUERY),
      ].includes(graphqlMock.info.operationName)
    ) {
      return false;
    }
    return true;
  }),
  ...[
    graphql.mutation(
      getOperationName(UPDATE_ONE_PERSON) ?? '',
      (req, res, ctx) => {
        return res(
          ctx.data({
            updateOnePerson: {
              ...fetchOneFromData(mockedPeopleData, req.variables.where.id),
              ...{
                company: {
                  id: req.variables.where.id,
                  name: updateSelectedCompany.name,
                  domainName: updateSelectedCompany.domainName,
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click on second row company cell', async () => {
      const secondRowCompanyCell = await canvas.findByText(
        mockedPeopleData[2].company.name,
      );

      await userEvent.click(
        secondRowCompanyCell.parentNode?.parentNode?.parentNode
          ?.parentElement as HTMLElement,
      );
    });

    await step('Type "Air" in relation picker', async () => {
      const relationInput = await canvas.findByPlaceholderText('Search');

      await userEvent.type(relationInput, 'Air', {
        delay: 200,
      });
    });

    await step('Select "Airbnb"', async () => {
      const airbnbChip = await canvas.findByText('Airbnb', {
        selector: 'div',
      });

      await userEvent.click(airbnbChip);
    });

    await step(
      'Click on last row company cell to exit relation picker',
      async () => {
        const otherCell = await canvas.findByText('Janice Dane');
        await userEvent.click(otherCell);
      },
    );

    await step('Check if Airbnb is in second row company cell', async () => {
      await canvas.findByText('Airbnb');
    });
  },
  parameters: {
    msw: editRelationMocks('Qonto', ['Airbnb', 'Aircall'], {
      name: 'Airbnb',
      domainName: 'airbnb.com',
    }),
  },
};

export const SelectRelationWithKeys: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    let firstRowCompanyCell = await canvas.findByText(
      mockedPeopleData[0].company.name,
    );
    await sleep(25);

    await userEvent.click(
      firstRowCompanyCell.parentNode?.parentNode?.parentNode
        ?.parentElement as HTMLElement,
    );
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

    await sleep(50);

    await userEvent.type(relationInput, '{arrowup}');

    await sleep(50);

    await userEvent.type(relationInput, '{arrowdown}');

    await sleep(50);

    await userEvent.type(relationInput, '{arrowdown}');

    await sleep(50);

    await userEvent.type(relationInput, '{enter}');

    await sleep(50);

    const allAirbns = await canvas.findAllByText('Aircall');
    expect(allAirbns.length).toBe(1);
  },
  parameters: {
    msw: editRelationMocks('Qonto', ['Airbnb', 'Aircall'], {
      name: 'Aircall',
      domainName: 'aircall.io',
    }),
  },
};
