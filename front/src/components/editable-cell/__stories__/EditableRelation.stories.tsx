import EditableRelation, { EditableRelationProps } from '../EditableRelation';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import CompanyChip, { CompanyChipPropsType } from '../../chip/CompanyChip';
import {
  Company,
  GraphqlQueryCompany,
} from '../../../interfaces/company.interface';
import { MockedProvider } from '@apollo/client/testing';
import { SEARCH_COMPANY_QUERY } from '../../../hooks/search/search';
import styled from '@emotion/styled';
import { People_Bool_Exp } from '../../../generated/graphql';
import { FilterType } from '../../table/table-header/interface';
import { FaBuilding } from 'react-icons/fa';

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
    id: '123',
    name: 'Heroku',
    domain_name: 'heroku.com',
  } as Company,
  ChipComponent: CompanyChip,
  chipComponentPropsMapper: (company: Company): CompanyChipPropsType => {
    return {
      name: company.name ?? '',
      picture: company.domainName
        ? `https://www.google.com/s2/favicons?domain=${company.domainName}&sz=256`
        : undefined,
    };
  },
  changeHandler: (relation: Company) => {
    console.log('changed', relation);
  },
  searchFilter: {
    key: 'company_name',
    label: 'Company',
    icon: <FaBuilding />,
    searchQuery: SEARCH_COMPANY_QUERY,
    searchTemplate: (searchInput: string) => ({
      name: { _ilike: `%${searchInput}%` },
    }),
    searchResultMapper: (company: GraphqlQueryCompany) => ({
      value: {
        id: company.id,
        name: company.name,
        domain_name: company.domain_name,
      },
    }),
    operands: [],
  } satisfies FilterType<People_Bool_Exp>,
};
