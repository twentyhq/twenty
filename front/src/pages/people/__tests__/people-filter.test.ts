import { cityFilter, companyFilter } from '../people-filters';

describe('PeopleFilter', () => {
  it(`should render the filter ${companyFilter.key}`, () => {
    expect(
      companyFilter.operands[0].whereTemplate({
        id: 'test-id',
        name: 'test-name',
        domainName: 'test-domain-name',
        __typename: 'companies',
      }),
    ).toMatchSnapshot();
  });

  it(`should render the filter ${cityFilter.key}`, () => {
    expect(cityFilter.operands[0].whereTemplate('Paris')).toMatchSnapshot();
  });
});
