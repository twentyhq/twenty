import { ColorScheme, GetCurrentUserQuery } from '~/generated/graphql';

type MockedUser = GetCurrentUserQuery['currentUser'];

export const avatarUrl =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAYABgAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABgAAAAAQAAAGAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABSgAwAEAAAAAQAAABQAAAAA/8AAEQgAFAAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACwgICggHCwoJCg0MCw0RHBIRDw8RIhkaFBwpJCsqKCQnJy0yQDctMD0wJyc4TDk9Q0VISUgrNk9VTkZUQEdIRf/bAEMBDA0NEQ8RIRISIUUuJy5FRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRf/dAAQAAv/aAAwDAQACEQMRAD8Ava1q728otYY98joSCTgZrnbXWdTtrhrfVZXWLafmcAEkdgR/hVltQku9Q8+OIEBcGOT+ID0PY1ka1KH2u8ToqnPLbmIqG7u6LtbQ7RXBRec4Uck9eKXcPWsKDWVnhWSL5kYcFelSf2m3901POh8jP//QoyIAnTuKpXsY82NsksUyWPU5q/L9z8RVK++/F/uCsVsaEURwgA4HtT9x9TUcf3KfUGh//9k=';

export const mockedUsersData: Array<MockedUser> = [
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
    __typename: 'User',
    email: 'charles@test.com',
    displayName: 'Charles Test',
    firstName: 'Charles',
    lastName: 'Test',
    avatarUrl: null,
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      workspace: {
        __typename: 'Workspace',
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        displayName: 'Twenty',
        domainName: 'twenty.com',
        inviteHash: 'twenty.com-invite-hash',
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACb0lEQVR4nO2VO4taQRTHr3AblbjxEVlwCwVhg7BoqqCIjy/gAyyFWNlYBOxsfH0KuxgQGwXRUkGuL2S7i1barGAgiwbdW93SnGOc4BonPiKahf3DwXFmuP/fPM4ZlvmlTxAhCBdzHnEQWYiv7Mr4C3NeuVYhQYDPzOUUQgDLBQGcLHNhvQK8DACPx8PTxiqVyvISG43GbyaT6Qfpn06n0m63e/tPAPF4vJ1MJu8kEsnWTCkWi1yr1RKGw+GDRqPBOTfr44vFQvD7/Q/lcpmaaVQAr9fLp1IpO22c47hGOBz+MB6PH+Vy+VYDAL8qlUoGtVotzOfzq4MAgsHgE/6KojiQyWR/bKVSqbSszHFM8Pl8z1YK48JsNltCOBwOnrYLO+8AAIjb+nHbycoTiUQfDJ7tFq4YAHiVSmXBxcD41u8flQU8z7fhzO0r83atVns3Go3u9Xr9x0O/RQXo9/tsIBBg6vX606a52Wz+bZ7P5/WwG29gxSJzhKgA6XTaDoFNF+krFAocmC//4yWEcSf2wTm7mCO19xFgSsKOLI16vV7b7XY7mRNoLwA0JymJ5uQIzgIAuX5PzDElT2m+E8BqtQ4ymcx7Yq7T6a6ZE4sKgOadTucaCwkxp1UzlEKh0GDxIXOwDWHAdi6Xe3swQDQa/Q7mywoolUpvsaptymazDWKxmBHTlWXZm405BFZoNpuGgwEmk4mE2SGtVivii4f1AO7J3ZopkQCQj7Ar1FeRChCJRJzVapX6DKNIfSc1Ax+wtQWQ55h6bH8FWDfYV4fO3wlwDr0C/BcADYiTPCxHqIEA2QsCZAkAKnRGkMbKN/sTX5YHPQ1e7SkAAAAASUVORK5CYII=',
      },
    },
    settings: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cde9y',
      __typename: 'UserSettings',
      locale: 'en',
      colorScheme: ColorScheme.System,
    },
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6c',
    __typename: 'User',
    email: 'felix@test.com',
    displayName: 'Felix Test',
    firstName: 'Felix',
    lastName: 'Test',
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      workspace: {
        __typename: 'Workspace',
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        displayName: 'Twenty',
        domainName: 'twenty.com',
        inviteHash: 'twenty.com-invite-hash',
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACb0lEQVR4nO2VO4taQRTHr3AblbjxEVlwCwVhg7BoqqCIjy/gAyyFWNlYBOxsfH0KuxgQGwXRUkGuL2S7i1barGAgiwbdW93SnGOc4BonPiKahf3DwXFmuP/fPM4ZlvmlTxAhCBdzHnEQWYiv7Mr4C3NeuVYhQYDPzOUUQgDLBQGcLHNhvQK8DACPx8PTxiqVyvISG43GbyaT6Qfpn06n0m63e/tPAPF4vJ1MJu8kEsnWTCkWi1yr1RKGw+GDRqPBOTfr44vFQvD7/Q/lcpmaaVQAr9fLp1IpO22c47hGOBz+MB6PH+Vy+VYDAL8qlUoGtVotzOfzq4MAgsHgE/6KojiQyWR/bKVSqbSszHFM8Pl8z1YK48JsNltCOBwOnrYLO+8AAIjb+nHbycoTiUQfDJ7tFq4YAHiVSmXBxcD41u8flQU8z7fhzO0r83atVns3Go3u9Xr9x0O/RQXo9/tsIBBg6vX606a52Wz+bZ7P5/WwG29gxSJzhKgA6XTaDoFNF+krFAocmC//4yWEcSf2wTm7mCO19xFgSsKOLI16vV7b7XY7mRNoLwA0JymJ5uQIzgIAuX5PzDElT2m+E8BqtQ4ymcx7Yq7T6a6ZE4sKgOadTucaCwkxp1UzlEKh0GDxIXOwDWHAdi6Xe3swQDQa/Q7mywoolUpvsaptymazDWKxmBHTlWXZm405BFZoNpuGgwEmk4mE2SGtVivii4f1AO7J3ZopkQCQj7Ar1FeRChCJRJzVapX6DKNIfSc1Ax+wtQWQ55h6bH8FWDfYV4fO3wlwDr0C/BcADYiTPCxHqIEA2QsCZAkAKnRGkMbKN/sTX5YHPQ1e7SkAAAAASUVORK5CYII=',
      },
    },
    settings: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdt7a',
      __typename: 'UserSettings',
      locale: 'en',
      colorScheme: ColorScheme.System,
    },
  },
];

export const mockedOnboardingUsersData: Array<MockedUser> = [
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
    __typename: 'User',
    email: 'workspace-onboarding@test.com',
    displayName: '',
    firstName: '',
    lastName: '',
    avatarUrl: null,
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      workspace: {
        __typename: 'Workspace',
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        displayName: '',
        domainName: '',
        inviteHash: 'twenty.com-invite-hash-1',
        logo: '',
      },
    },
    settings: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cde9y',
      __typename: 'UserSettings',
      locale: 'en',
      colorScheme: ColorScheme.System,
    },
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
    __typename: 'User',
    email: 'profile-onboarding@test.com',
    displayName: '',
    firstName: '',
    lastName: '',
    avatarUrl: null,
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      workspace: {
        __typename: 'Workspace',
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        displayName: 'Test',
        domainName: 'test.com',
        inviteHash: 'twenty.com-invite-hash-2',
        logo: '',
      },
    },
    settings: {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cde9y',
      __typename: 'UserSettings',
      locale: 'en',
      colorScheme: ColorScheme.System,
    },
  },
];
