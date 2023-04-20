import { Company } from '../../interfaces/company.interface';
import { Pipe } from '../../interfaces/pipe.interface';

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
