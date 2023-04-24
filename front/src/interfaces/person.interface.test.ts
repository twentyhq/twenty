import { mapGqlPerson, mapPerson } from './person.interface';

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

  it('should map person back', () => {
    const person = mapGqlPerson({
      id: 1,
      fullName: 'John Doe',
      email: '',
      phone: '',
      city: '',
      company: {
        id: 1,
        name: '',
        domain: '',
      },
      creationDate: new Date(),
      pipe: {
        id: 3,
        name: '',
        icon: '',
      },
      countryCode: '',
    });
    expect(person.firstname).toBe('John');
  });
});
