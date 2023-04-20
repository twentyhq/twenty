import { Person } from '../../interfaces/person.interface';

export const defaultData: Array<Person> = [
  {
    fullName: 'Alexandre Prot',
    picture: 'http://placekitten.com/256',
    email: 'alexandre@qonto.com',
    company: { id: 1, name: 'Qonto', domain: 'qonto.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 23, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
  {
    fullName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    company: { id: 2, name: 'LinkedIn', domain: 'linkedin.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 22, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
  {
    fullName: 'Alexandre Prot',
    picture: 'http://placekitten.com/256',
    email: 'alexandre@qonto.com',
    company: { id: 5, name: 'Sequoia', domain: 'sequoiacap.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 21, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },

  {
    fullName: 'Alexandre Prot',
    email: 'alexandre@qonto.com',
    company: { id: 2, name: 'Facebook', domain: 'facebook.com' },
    phone: '06 12 34 56 78',
    creationDate: new Date('Feb 25, 2018'),
    pipe: { id: 1, name: 'Sales Pipeline', icon: 'faUser' },
    city: 'Paris',
    countryCode: 'FR',
  },
];
