import { Tenant } from './tenant.interface';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  tenant?: Tenant;
}
