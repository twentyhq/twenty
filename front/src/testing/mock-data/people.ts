import { Company } from '@/companies/types/Company';
import { Person } from '@/people/types/Person';

type RequiredAndNotNull<T> = {
  [P in keyof T]-?: Exclude<T[P], null | undefined>;
};

type MockedPerson = RequiredAndNotNull<
  Pick<
    Person,
    | 'id'
    | 'name'
    | 'linkedinLink'
    | 'xLink'
    | 'jobTitle'
    | 'email'
    | 'phone'
    | 'city'
    | 'avatarUrl'
    | 'createdAt'
    | 'companyId'
  > & {
    company: Pick<Company, 'id' | 'name' | 'domainName'>;
  }
>;

export const mockedPeopleData: MockedPerson[] = [
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
    name: {
      firstName: 'Alexandre',
      lastName: 'Prot',
    },
    email: 'alexandre@qonto.com',
    linkedinLink: {
      url: 'https://www.linkedin.com/in/alexandreprot/',
      label: 'https://www.linkedin.com/in/alexandreprot/',
    },
    xLink: {
      url: 'https://twitter.com/alexandreprot',
      label: 'https://twitter.com/alexandreprot',
    },
    avatarUrl:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAADygAwAEAAAAAQAAADwAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIADwAPAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAoHCBUSFRgSEhUYGBgYGBgYGBgYGBgYGBgYGBgZGRgaGBgcIS4lHB4rIRgYJjgmKy8xNTU1GiQ7QDszPy40NTH/2wBDAQwMDBAPEBwSEh40ISQkMTQ0NjQxNDQ2NDQ0NDQ0MTQ0NDQ0NDQ0NDQ0NDE0NDQ0NDQ0PzQ0NDQ0NDQ0NDQ0NDT/3QAEAAT/2gAMAwEAAhEDEQA/AOtApcUtLWpkJiub1TxlawHaC0pGM+WAQM9ixIGfal8bas8ESwwjMs5KLjqq4+ZgO55A/wCBe1cDceGLxVyYCysOqfNjnoQOQfzqJTs7GkYNq53uleLba5KoCyO2fldcDI7b/uk/jW8VrxSSJowQ6OPqhwPxxXofw81Mz27IxyYmCjPUKRlee/f8qIyuKUbHT4oxT6SrIP/Q6+ilorUyOJ147tTjzjbFArEk4A3M/wD9au20u4Rl+R1bHXawJFZ89vGbgM4GWj2898HI/rTbXSIo5lkj5fpuyWO3upPccVx1H7zO6nH3EizroBjbIB/KuL+H0eJ7soMIBGPx3Ocfkf1rUbRPPzM0jYYtv3MTjkjCDOF7flS+C7Hyo5XznzZSRxjhAEH16E1VH4ia/wAJ0dFFLXUcZ//R7HFIRWXq/iS1teJZRu6hEG9+/JC9Bx1OK43VPiM7ZW2iCejyHc34Ivyj8zWpmdtqkiq8QfoxYe3bGfryKbNb8HEzIwyUYKCQCOnbP0IPasPwtKb+3JlcvICUck8hgSVYAcLkFSMelSya3LbL5U8Bl28K67efTcD0P0rjm7zZ3UtIocsZEQhDEu5IXrnaTks+Scnqa3LWBY1EaDCqMDkn9TXCSapNBIb+ZR0ZRGSQArY+Vf8Aa4GD9a6XRvE9tdYCuFc/8s3IVvw7MPcVtRStcwrybZuilpopa2Oc/9Ly0J/kUBaVTS1sZl7SNWmtH8yB9pPBBGVYZzhl7j9R611T/ERmHzWqFvXzDt+uNuevb9a4eiolCMtyozlHYu6zrE12QZSAF+6ijCjPfHc+5/Ss3bUlFUkkrITbbuze8P8Aiqe0IDMZIsjcjEsQOh8ticqcduhx26163FKGUMpyGAII6EEZBrwQmvX/AAFIXso93O0ug/3Vdgo/KmI//9k=',
    jobTitle: 'CEO',
    companyId: '5c21e19e-e049-4393-8c09-3e3f8fb09ecb',
    company: {
      id: '5c21e19e-e049-4393-8c09-3e3f8fb09ecb',
      name: 'Qonto',
      domainName: 'qonto.com',
    },
    phone: '06 12 34 56 78',
    createdAt: '2023-04-20T13:20:09.158312+00:00',
    city: 'Paris',
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
    name: { firstName: 'John', lastName: 'Doe' },
    linkedinLink: {
      url: 'https://www.linkedin.com/in/johndoe/',
      label: 'https://www.linkedin.com/in/johndoe/',
    },
    xLink: {
      url: 'https://twitter.com/johndoe',
      label: 'https://twitter.com/johndoe',
    },
    avatarUrl: '',
    jobTitle: 'CTO',
    email: 'john@linkedin.com',
    companyId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6e',
    company: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6e',
      name: 'LinkedIn',
      domainName: 'linkedin.com',
    },
    phone: '06 12 34 56 78',
    createdAt: '2023-04-20T13:20:09.158312+00:00',
    city: 'Paris',
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6f',
    name: {
      firstName: 'Jane',
      lastName: 'Doe',
    },
    linkedinLink: {
      url: 'https://www.linkedin.com/in/janedoe/',
      label: 'https://www.linkedin.com/in/janedoe/',
    },
    xLink: {
      url: 'https://twitter.com/janedoe',
      label: 'https://twitter.com/janedoe',
    },
    avatarUrl: '',
    jobTitle: 'Investor',
    email: 'jane@sequoiacap.com',
    companyId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6g',
    company: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6g',
      name: 'Sequoia',
      domainName: 'sequoiacap.com',
    },
    phone: '06 12 34 56 78',
    createdAt: '2023-04-20T13:20:09.158312+00:00',
    city: 'Paris',
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6h',
    name: {
      firstName: 'Janice',
      lastName: 'Dane',
    },
    email: 'janice@facebook.com',
    linkedinLink: {
      url: 'https://www.linkedin.com/in/janicedane/',
      label: 'https://www.linkedin.com/in/janicedane/',
    },
    xLink: {
      url: 'https://twitter.com/janicedane',
      label: 'https://twitter.com/janicedane',
    },
    avatarUrl: '',
    jobTitle: 'CEO',
    companyId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6i',
    company: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6i',
      name: 'Facebook',
      domainName: 'facebook.com',
    },
    phone: '06 12 34 56 78',
    createdAt: '2023-04-20T13:20:09.158312+00:00',
    city: 'Paris',
  },
];

export const mockedEmptyPersonData = {
  id: 'ce7f0a37-88d7-4cd8-8b41-6721c57195b5',
  firstName: '',
  lastName: '',
  phone: null,
  email: null,
  city: null,
  displayName: null,
  avatarUrl: null,
  createdAt: null,
  jobTitle: null,
  linkedinUrl: null,
  xUrl: null,
  _activityCount: null,
  company: null,
  __typename: 'Person',
};
