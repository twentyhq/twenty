import { GraphqlQueryPerson } from '../../../interfaces/person.interface';
import { mockCompanyData } from '../../companies/__stories__/mock-data';
import { defaultData } from '../default-data';
import {
  cityFilter,
  companyFilter,
  emailFilter,
  fullnameFilter,
} from '../people-table';

const JohnDoeUser = defaultData.find(
  (user) => user.email === 'john@linkedin.com',
) as GraphqlQueryPerson;

describe('PeopleFilter', () => {
  it('Fullname filter should generate the where variable of the GQL call', () => {
    const filterSelectedValue = fullnameFilter.searchResultMapper(JohnDoeUser);
    for (const operand of fullnameFilter.operands) {
      expect(
        fullnameFilter.whereTemplate(operand, filterSelectedValue.value),
      ).toMatchSnapshot();
    }
  });
  it('Email filter should generate the where variable of the GQL call', () => {
    const filterSelectedValue = emailFilter.searchResultMapper(JohnDoeUser);
    for (const operand of emailFilter.operands) {
      expect(
        emailFilter.whereTemplate(operand, filterSelectedValue.value),
      ).toMatchSnapshot();
    }
  });
  it('City filter should generate the where variable of the GQL call', () => {
    const filterSelectedValue = cityFilter.searchResultMapper(JohnDoeUser);
    for (const operand of cityFilter.operands) {
      expect(
        cityFilter.whereTemplate(operand, filterSelectedValue.value),
      ).toMatchSnapshot();
    }
  });
  it('Company fitler should generate the where variable of the GQL call', () => {
    const filterSelectedValue = companyFilter.searchResultMapper(
      mockCompanyData[0],
    );
    for (const operand of companyFilter.operands) {
      expect(
        companyFilter.whereTemplate(operand, filterSelectedValue.value),
      ).toMatchSnapshot();
    }
  });
});
