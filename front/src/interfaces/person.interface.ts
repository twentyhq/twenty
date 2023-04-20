import { Company } from './company.interface';
import { Pipe } from './pipe.interface';

export type Person = {
  fullName: string;
  picture?: string;
  email: string;
  company: Company;
  phone: string;
  creationDate: Date;
  pipe: Pipe;
  city: string;
  countryCode: string;
};

export type GraphqlPerson = {
  city: string;
  company: {
    __typename: string;
    company_name: string;
    company_domain: string;
  };
  created_at: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  phone: string;
  __typename: string;
};
