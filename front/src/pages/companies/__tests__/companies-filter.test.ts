import { FilterType } from '../../../components/table/table-header/interface';
import { Companies_Bool_Exp } from '../../../generated/graphql';
import { GraphqlQueryCompany } from '../../../interfaces/company.interface';
import { GraphqlQueryPerson } from '../../../interfaces/person.interface';
import {
  SEARCH_COMPANY_QUERY,
  SEARCH_PEOPLE_QUERY,
} from '../../../hooks/search/search';
import { mockData } from './__data__/mock-data';
import { availableFilters } from '../companies-table';

function assertFilterUseCompanySearch<FilterValue>(
  filter: FilterType<Companies_Bool_Exp>,
): filter is FilterType<Companies_Bool_Exp> & {
  searchResultMapper: (data: GraphqlQueryCompany) => {
    displayValue: string;
    value: FilterValue;
  };
} {
  return filter.searchQuery === SEARCH_COMPANY_QUERY;
}

function assertFilterUsePeopleSearch<FilterValue>(
  filter: FilterType<Companies_Bool_Exp>,
): filter is FilterType<Companies_Bool_Exp> & {
  searchResultMapper: (data: GraphqlQueryPerson) => {
    displayValue: string;
    value: FilterValue;
  };
} {
  return filter.searchQuery === SEARCH_PEOPLE_QUERY;
}

const AirbnbCompany = mockData.find(
  (user) => user.name === 'Airbnb',
) as GraphqlQueryCompany;

describe('CompaniesFilter', () => {
  for (const filter of availableFilters) {
    it(`should render the filter ${filter.key}`, () => {
      if (assertFilterUseCompanySearch(filter)) {
        const filterSelectedValue = filter.searchResultMapper(mockData[0]);
        for (const operand of filter.operands) {
          expect(
            filter.whereTemplate(operand, filterSelectedValue.value),
          ).toMatchSnapshot();
        }
      }
      if (assertFilterUsePeopleSearch(filter)) {
        const filterSelectedValue = filter.searchResultMapper(AirbnbCompany);
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
