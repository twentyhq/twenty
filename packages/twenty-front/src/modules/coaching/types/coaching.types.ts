export type CoachingFilterValues = {
  searchTerm: string;
};

export type CoachingCustomerRecord = {
  id: string;
  name: string;
  createdAt: string;
  wpUserId: string | null;
  email: string | null;
  displayName: string | null;
  registeredDate: string | null;
};
