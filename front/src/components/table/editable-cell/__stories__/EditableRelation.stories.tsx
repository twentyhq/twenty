import EditableRelation, { EditableRelationProps } from '../EditableRelation';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import CompanyChip, { CompanyChipPropsType } from '../../../chips/CompanyChip';
import {
  Company,
  mapToCompany,
} from '../../../../interfaces/company.interface';
import { MockedProvider } from '@apollo/client/testing';
import { SEARCH_COMPANY_QUERY } from '../../../../services/search/search';
import styled from '@emotion/styled';
import { SearchConfigType } from '../../table-header/interface';

const component = {
  title: 'editable-cell/EditableRelation',
  component: EditableRelation,
};

export default component;

const StyledParent = styled.div`
  height: 400px;
`;

const mocks = [
  {
    request: {
      query: SEARCH_COMPANY_QUERY,
      variables: {
        where: undefined,
      },
    },
    result: {
      data: {
        companies: [],
      },
    },
  },
  {
    request: {
      query: SEARCH_COMPANY_QUERY,
      variables: {
        where: { name: { _ilike: '%%' } },
        limit: 5,
      },
    },
    result: {
      data: {
        searchResults: [
          { id: 'abnb', name: 'Airbnb', domain_name: 'abnb.com' },
        ],
      },
    },
  },
];

const Template: StoryFn<
  typeof EditableRelation<Company, CompanyChipPropsType>
> = (args: EditableRelationProps<Company, CompanyChipPropsType>) => {
  return (
    <MockedProvider mocks={mocks}>
      <ThemeProvider theme={lightTheme}>
        <StyledParent data-testid="content-editable-parent">
          <EditableRelation<Company, CompanyChipPropsType> {...args} />
        </StyledParent>
      </ThemeProvider>
    </MockedProvider>
  );
};

export const EditableRelationStory = Template.bind({});
EditableRelationStory.args = {
  relation: {
    __typename: 'companies',
    id: '123',
    name: 'Heroku',
    domain_name: 'heroku.com',
  } as Company,
  ChipComponent: CompanyChip,
  chipComponentPropsMapper: (company: Company): CompanyChipPropsType => {
    return {
      name: company.name || '',
      picture: company.domainName
        ? `https://www.google.com/s2/favicons?domain=${company.domainName}&sz=256`
        : undefined,
    };
  },
  changeHandler: (relation: Company) => {
    console.log('changed', relation);
  },
  searchConfig: {
    query: SEARCH_COMPANY_QUERY,
    template: (searchInput: string) => ({
      name: { _ilike: `%${searchInput}%` },
    }),
    resultMapper: (company) => ({
      render: (company) => company.name,
      value: mapToCompany(company),
    }),
  } satisfies SearchConfigType<Company>,
};
