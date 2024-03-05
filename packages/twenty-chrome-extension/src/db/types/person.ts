export type Person = {
  name: {
    firstName: string;
    lastName: string;
  };
  avatarUrl?: string;
  jobTitle?: string;
  linkedinLink: {
    url: string;
    label: string;
  };
  xLink?: {
    url: string;
    label: string;
  };
  city?: string;
  email?: string;
  phone?: string;
  companyId?: string;
};
