export type CoachingFilterValues = {
  searchTerm: string;
};

export type CoachingCustomerRecord = {
  id: string;
  name: string;
  createdAt: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
};
