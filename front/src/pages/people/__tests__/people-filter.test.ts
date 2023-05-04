import { GraphqlQueryPerson } from '../../../interfaces/person.interface';
import { defaultData } from '../default-data';
import { fullnameFilter } from '../people-table';

const JohnDoeUser = defaultData.find(
  (user) => user.email === 'john@linkedin.com',
) as GraphqlQueryPerson;

describe('PeopleFilter', () => {
  it('Fullname filter should generate the where variable of the GQL call', () => {
    const filterSelectedValue = fullnameFilter.searchResultMapper(JohnDoeUser);
    for (const operand of fullnameFilter.operands) {
      expect(
        fullnameFilter.whereTemplate(operand, filterSelectedValue),
      ).toMatchSnapshot();
    }
  });
});
