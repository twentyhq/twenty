export type Department = 'engineering' | 'sales' | 'marketing' | 'hr' | 'finance' | 'operations';

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export type EmployeeData = {
  id: string;
  name: string;
  email: string;
  department: Department;
  title: string;
  managerId?: string;
  status: EmployeeStatus;
  hireDate: string;
  avatarUrl?: string;
};

export type PayrollPeriod = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'processing' | 'completed';
};

export type PayrollSummary = {
  periodId: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  currency: string;
};

export type OrgNode = {
  id: string;
  name: string;
  title: string;
  department: Department;
  children: OrgNode[];
};
