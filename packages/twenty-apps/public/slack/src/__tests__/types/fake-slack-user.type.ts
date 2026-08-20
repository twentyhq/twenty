export type FakeSlackUser = {
  id: string;
  displayName?: string;
  realName?: string;
  email?: string;
  teamId?: string;
  isBot?: boolean;
  isDeleted?: boolean;
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
  isEmailConfirmed?: boolean;
};
