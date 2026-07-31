export type PersonDuplicatePhone = {
  number: string;
  countryCode: string;
  callingCode: string;
};

export type PersonDuplicateLink = {
  label: string;
  url: string;
};

export type PersonDuplicateCompany = {
  id: string;
  name: string;
};

export type PersonDuplicatePerson = {
  id: string;
  firstName: string;
  lastName: string;
  emails: string[];
  phones: PersonDuplicatePhone[];
  linkedinLinks: PersonDuplicateLink[];
  jobTitle: string;
  company: PersonDuplicateCompany | null;
  avatarUrl: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
};

export type PersonDuplicateGroup = {
  id: string;
  reasons: Array<'EMAIL' | 'LINKEDIN' | 'PHONE' | 'NAME'>;
  detectedAt: string;
  people: PersonDuplicatePerson[];
};

export type PersonDuplicateGroupsData = {
  personDuplicateGroups: {
    groups: PersonDuplicateGroup[];
    totalCount: number;
    canResolve: boolean;
  };
};

export type PersonDuplicatePairInput = {
  leftPersonId: string;
  rightPersonId: string;
};
