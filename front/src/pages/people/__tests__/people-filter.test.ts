import {
  assertFilterUseCompanySearch,
  assertFilterUsePeopleSearch,
} from '../../../components/table/table-header/interface';
import { GraphqlQueryPerson } from '../../../interfaces/person.interface';
import { mockCompanyData } from '../../companies/__stories__/mock-data';
import { defaultData } from '../default-data';
import { availableFilters } from '../people-table';

const JohnDoeUser = defaultData.find(
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
  }
});
