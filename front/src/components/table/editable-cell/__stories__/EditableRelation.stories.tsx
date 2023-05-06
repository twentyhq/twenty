import EditableRelation, { EditableRelationProps } from '../EditableRelation';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import CompanyChip, { CompanyChipPropsType } from '../../../chips/CompanyChip';
import {
  GraphqlQueryCompany,
  PartialCompany,
} from '../../../../interfaces/company.interface';
import { MockedProvider } from '@apollo/client/testing';
import { SEARCH_COMPANY_QUERY } from '../../../../services/search/search';
import styled from '@emotion/styled';
import { People_Bool_Exp } from '../../../../generated/graphql';
import { FilterType } from '../../table-header/interface';
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
  typeof EditableRelation<PartialCompany, CompanyChipPropsType>
> = (args: EditableRelationProps<PartialCompany, CompanyChipPropsType>) => {
  return (
    <MockedProvider mocks={mocks}>
      <ThemeProvider theme={lightTheme}>
        <StyledParent data-testid="content-editable-parent">
          <EditableRelation<PartialCompany, CompanyChipPropsType> {...args} />
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
  } as PartialCompany,
  ChipComponent: CompanyChip,
  chipComponentPropsMapper: (company: PartialCompany): CompanyChipPropsType => {
    return {
      name: company.name,
      picture: `https://www.google.com/s2/favicons?domain=${company.domain_name}&sz=256`,
    };
  },
  changeHandler: (relation: PartialCompany) => {
    console.log('changed', relation);
  },
  searchFilter: {
    key: 'company_name',
    label: 'Company',
    icon: <FaBuilding />,
    whereTemplate: () => {
      return {};
    },
    searchQuery: SEARCH_COMPANY_QUERY,
    searchTemplate: (searchInput: string) => ({
      name: { _ilike: `%${searchInput}%` },
    }),
    searchResultMapper: (company: GraphqlQueryCompany) => ({
      displayValue: company.name,
      value: {
        id: company.id,
        name: company.name,
        domain_name: company.domain_name,
      },
    }),
    operands: [],
  } satisfies FilterType<People_Bool_Exp>,
};
