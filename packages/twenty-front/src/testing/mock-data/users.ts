import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  FeatureFlagKey,
  OnboardingStatus,
  SubscriptionInterval,
  SubscriptionStatus,
  User,
  Workspace,
  WorkspaceActivationStatus,
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';

type MockedUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'canImpersonate'
  | '__typename'
  | 'supportUserHash'
  | 'onboardingStatus'
  | 'userVars'
  | 'analyticsTinybirdJwts'
> & {
  workspaceMember: WorkspaceMember | null;
  locale: string;
  currentWorkspace: Workspace;
  workspaces: Array<{ workspace: Workspace }>;
  workspaceMembers: WorkspaceMember[];
};

export const avatarUrl =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAYABgAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABgAAAAAQAAAGAAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABSgAwAEAAAAAQAAABQAAAAA/8AAEQgAFAAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMACwgICggHCwoJCg0MCw0RHBIRDw8RIhkaFBwpJCsqKCQnJy0yQDctMD0wJyc4TDk9Q0VISUgrNk9VTkZUQEdIRf/bAEMBDA0NEQ8RIRISIUUuJy5FRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRf/dAAQAAv/aAAwDAQACEQMRAD8Ava1q728otYY98joSCTgZrnbXWdTtrhrfVZXWLafmcAEkdgR/hVltQku9Q8+OIEBcGOT+ID0PY1ka1KH2u8ToqnPLbmIqG7u6LtbQ7RXBRec4Uck9eKXcPWsKDWVnhWSL5kYcFelSf2m3901POh8jP//QoyIAnTuKpXsY82NsksUyWPU5q/L9z8RVK++/F/uCsVsaEURwgA4HtT9x9TUcf3KfUGh//9k=';
export const workspaceLogoUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACb0lEQVR4nO2VO4taQRTHr3AblbjxEVlwCwVhg7BoqqCIjy/gAyyFWNlYBOxsfH0KuxgQGwXRUkGuL2S7i1barGAgiwbdW93SnGOc4BonPiKahf3DwXFmuP/fPM4ZlvmlTxAhCBdzHnEQWYiv7Mr4C3NeuVYhQYDPzOUUQgDLBQGcLHNhvQK8DACPx8PTxiqVyvISG43GbyaT6Qfpn06n0m63e/tPAPF4vJ1MJu8kEsnWTCkWi1yr1RKGw+GDRqPBOTfr44vFQvD7/Q/lcpmaaVQAr9fLp1IpO22c47hGOBz+MB6PH+Vy+VYDAL8qlUoGtVotzOfzq4MAgsHgE/6KojiQyWR/bKVSqbSszHFM8Pl8z1YK48JsNltCOBwOnrYLO+8AAIjb+nHbycoTiUQfDJ7tFq4YAHiVSmXBxcD41u8flQU8z7fhzO0r83atVns3Go3u9Xr9x0O/RQXo9/tsIBBg6vX606a52Wz+bZ7P5/WwG29gxSJzhKgA6XTaDoFNF+krFAocmC//4yWEcSf2wTm7mCO19xFgSsKOLI16vV7b7XY7mRNoLwA0JymJ5uQIzgIAuX5PzDElT2m+E8BqtQ4ymcx7Yq7T6a6ZE4sKgOadTucaCwkxp1UzlEKh0GDxIXOwDWHAdi6Xe3swQDQa/Q7mywoolUpvsaptymazDWKxmBHTlWXZm405BFZoNpuGgwEmk4mE2SGtVivii4f1AO7J3ZopkQCQj7Ar1FeRChCJRJzVapX6DKNIfSc1Ax+wtQWQ55h6bH8FWDfYV4fO3wlwDr0C/BcADYiTPCxHqIEA2QsCZAkAKnRGkMbKN/sTX5YHPQ1e7SkAAAAASUVORK5CYII=';

export const mockCurrentWorkspace: Workspace = {
  subdomain: 'acme.twenty.com',
  id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6w',
  displayName: 'Twenty',
  domainName: 'twenty.com',
  inviteHash: 'twenty.com-invite-hash',
  logo: workspaceLogoUrl,
  isPublicInviteLinkEnabled: true,
  allowImpersonation: true,
  activationStatus: WorkspaceActivationStatus.ACTIVE,
  hasValidEntrepriseKey: false,
  isGoogleAuthEnabled: true,
  isPasswordAuthEnabled: true,
  isMicrosoftAuthEnabled: false,
  featureFlags: [
    {
      id: '1492de61-5018-4368-8923-4f1eeaf988c4',
      key: FeatureFlagKey.IsAirtableIntegrationEnabled,
      value: true,
      workspaceId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6w',
    },
    {
      id: '1492de61-5018-4368-8923-4f1eeaf988c5',
      key: FeatureFlagKey.IsPostgreSqlIntegrationEnabled,
      value: true,
      workspaceId: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6w',
    },
  ],
  createdAt: '2023-04-26T10:23:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  metadataVersion: 1,
  currentBillingSubscription: {
    __typename: 'BillingSubscription',
    id: '7efbc3f7-6e5e-4128-957e-8d86808cdf6a',
    interval: SubscriptionInterval.Month,
    status: SubscriptionStatus.Active,
  },
  workspaceMembersCount: 1,
  databaseSchema: '',
  databaseUrl: '',
};

export const mockedWorkspaceMemberData: WorkspaceMember = {
  __typename: 'WorkspaceMember',
  id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
  colorScheme: 'Light',
  avatarUrl,
  locale: 'en',
  name: {
    firstName: 'Charles',
    lastName: 'Test',
  },
  createdAt: '2023-04-26T10:23:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  userId: '2603c1f9-0172-4ea6-986c-eeaccdf7f4cf',
  userEmail: 'charles@test.com',
  dateFormat: WorkspaceMemberDateFormatEnum.DayFirst,
  timeFormat: WorkspaceMemberTimeFormatEnum.Hour_24,
  timeZone: 'America/New_York',
};

export const mockedUserData: MockedUser = {
  id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
  __typename: 'User',
  email: 'charles@test.com',
  firstName: 'Charles',
  lastName: 'Test',
  canImpersonate: false,
  supportUserHash:
    'a95afad9ff6f0b364e2a3fd3e246a1a852c22b6e55a3ca33745a86c201f9c10d',
  workspaceMember: mockedWorkspaceMemberData,
  currentWorkspace: mockCurrentWorkspace,
  locale: 'en',
  workspaces: [{ workspace: mockCurrentWorkspace }],
  workspaceMembers: [mockedWorkspaceMemberData],
  onboardingStatus: OnboardingStatus.Completed,
  userVars: {},
  analyticsTinybirdJwts: null,
};

export const mockedOnboardingUserData = (
  onboardingStatus?: OnboardingStatus,
) => {
  return {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
    __typename: 'User',
    email: 'workspace-onboarding@test.com',
    firstName: '',
    lastName: '',
    canImpersonate: false,
    supportUserHash:
      '4fb61d34ed3a4aeda2476d4b308b5162db9e1809b2b8277e6fdc6efc4a609254',
    workspaceMember: null,
    currentWorkspace: mockCurrentWorkspace,
    locale: 'en',
    workspaces: [{ workspace: mockCurrentWorkspace }],
    onboardingStatus: onboardingStatus || null,
  };
};
