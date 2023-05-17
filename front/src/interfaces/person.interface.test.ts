import { mapGqlPerson, mapPerson } from './person.interface';

describe('mapPerson', () => {
  it('should map person', () => {
    const person = mapPerson({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      firstname: 'John',
      lastname: 'Doe',
      email: '',
      phone: '',
      city: '',
      created_at: '',
      company: {
        __typename: '',
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        name: '',
        domain_name: '',
        employees: 0,
        address: '',
        created_at: '',
        account_owner: null,
      },
      __typename: '',
    });
    expect(person.firstname).toBe('John');
  });

  it('should map person back', () => {
    const person = mapGqlPerson({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      firstname: 'John',
      lastname: 'Doe',
      email: '',
      phone: '',
      city: '',
      company: {
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        name: 'Test',
        domain_name: '',
        opportunities: [],
        employees: 0,
        address: '',
        creationDate: new Date(),
      },
      creationDate: new Date(),
      pipe: {
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6c',
        name: '',
        icon: '',
      },
    });
    expect(person.firstname).toBe('John');
  });
});
