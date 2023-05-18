import { employeesFilter, nameFilter } from '../companies-filters';

describe('Companies Filter', () => {
  it(`should render the filter ${nameFilter.key}`, () => {
    expect(nameFilter.operands[0].whereTemplate('name')).toMatchSnapshot();
  });

  it(`should render the filter ${employeesFilter.key}`, () => {
    expect(employeesFilter.operands[0].whereTemplate('2')).toMatchSnapshot();
  });
});
