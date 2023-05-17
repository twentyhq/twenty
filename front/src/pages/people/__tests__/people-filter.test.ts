import { cityFilter } from '../people-table';

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
        pipe: null,
        company: null,
      }),
    ).toMatchSnapshot();
  });
});
