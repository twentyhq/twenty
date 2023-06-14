import { cityFilter, companyFilter } from '../people-filters';

describe('PeopleFilter', () => {
  it(`should render the filter ${companyFilter.key} which relation search`, () => {
    expect(
      companyFilter.operands[0].whereTemplate({
        id: 'test-id',
        name: 'test-name',
        domainName: 'test-domain-name',
        __typename: 'Company',
      }),
    ).toMatchSnapshot();
  });

  it(`should render the filter ${cityFilter.key} which is text search`, () => {
    expect(cityFilter.operands[0].whereTemplate('Paris')).toMatchSnapshot();
  });
});
