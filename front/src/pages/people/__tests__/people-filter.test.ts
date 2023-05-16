import { FilterType } from '../../../components/table/table-header/interface';
import { People_Bool_Exp } from '../../../generated/graphql';
import { GraphqlQueryCompany } from '../../../interfaces/company.interface';
import { GraphqlQueryPerson } from '../../../interfaces/person.interface';
import {
  SEARCH_COMPANY_QUERY,
  SEARCH_PEOPLE_QUERY,
} from '../../../hooks/search/search';
import { mockData as mockCompanyData } from '../../companies/__tests__/__data__/mock-data';
import { mockData as mockPeopleData } from './__data__/mock-data';
import { availableFilters } from '../people-table';

function assertFilterUseCompanySearch<FilterValue>(
  filter: FilterType<People_Bool_Exp>,
): filter is FilterType<People_Bool_Exp> & {
  searchResultMapper: (data: GraphqlQueryCompany) => {
    displayValue: string;
    value: FilterValue;
  };
} {
  return filter.searchQuery === SEARCH_COMPANY_QUERY;
}

function assertFilterUsePeopleSearch<FilterValue>(
  filter: FilterType<People_Bool_Exp>,
): filter is FilterType<People_Bool_Exp> & {
  searchResultMapper: (data: GraphqlQueryPerson) => {
    displayValue: string;
    value: FilterValue;
  };
} {
  return filter.searchQuery === SEARCH_PEOPLE_QUERY;
}

const JohnDoeUser = mockPeopleData.find(
  (user) => user.email === 'john@linkedin.com',
) as GraphqlQueryPerson;

describe('PeopleFilter', () => {
  for (const filter of availableFilters) {
    it(`should render the filter ${filter.key}`, () => {
      if (assertFilterUseCompanySearch(filter)) {
        const filterSelectedValue = filter.searchResultMapper(
          mockCompanyData[0],
        );
        for (const operand of filter.operands) {
          expect(
            filter.whereTemplate(operand, filterSelectedValue.value),
          ).toMatchSnapshot();
        }
      }
      if (assertFilterUsePeopleSearch(filter)) {
        const filterSelectedValue = filter.searchResultMapper(JohnDoeUser);
        for (const operand of filter.operands) {
          expect(
            filter.whereTemplate(operand, filterSelectedValue.value),
          ).toMatchSnapshot();
        }
      }
    });
    it(`should render the serch ${filter.key} with the searchValue`, () => {
      expect(filter.searchTemplate('Search value')).toMatchSnapshot();
    });
  }
});
