import { mapPerson } from './person.interface';

describe('mapPerson', () => {
  it('should map person', () => {
    const person = mapPerson({
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      email: '',
      phone: '',
      city: '',
      created_at: '',
      company: {
        __typename: '',
        id: 1,
        company_name: '',
        company_domain: '',
      },
      __typename: '',
    });
    expect(person.fullName).toBe('John Doe');
  });
});
