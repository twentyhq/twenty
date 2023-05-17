import { cityFilter } from '../people-filters';

describe('PeopleFilter', () => {
  it(`should render the filter ${cityFilter.key}`, () => {
    expect(
      cityFilter.operands[0].whereTemplate({
        id: 'test-id',
        city: 'Paris',
        email: 'john@doe.com',
        firstname: 'John',
        lastname: 'Doe',
        phone: '0123456789',
        creationDate: new Date(),
        pipes: [],
        company: null,
        __typename: 'people',
      }),
    ).toMatchSnapshot();
  });
});
