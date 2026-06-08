import { describe, expect, it } from 'vitest';

import { COMPANY_TYPE_OPTIONS } from 'src/constants/company-type-options';
import { INFERRED_SALARY_OPTIONS } from 'src/constants/inferred-salary-options';
import { JOB_ROLE_OPTIONS } from 'src/constants/job-role-options';
import { JOB_TITLE_CLASS_OPTIONS } from 'src/constants/job-title-class-options';
import { JOB_TITLE_SUB_ROLE_OPTIONS } from 'src/constants/job-title-sub-role-options';
import { LOCATION_CONTINENT_OPTIONS } from 'src/constants/location-continent-options';
import { MIC_EXCHANGE_OPTIONS } from 'src/constants/mic-exchange-options';
import { SENIORITY_OPTIONS } from 'src/constants/seniority-options';
import { SEX_OPTIONS } from 'src/constants/sex-options';
import { type SelectOptionMeta } from 'src/types/select-option-meta';

import companyTypeField from 'src/fields/company/pdl-company-type.field';
import locationContinentField from 'src/fields/company/pdl-location-continent.field';
import micExchangeField from 'src/fields/company/pdl-mic-exchange.field';
import inferredSalaryField from 'src/fields/person/pdl-inferred-salary.field';
import jobRoleField from 'src/fields/person/pdl-job-role.field';
import jobTitleClassField from 'src/fields/person/pdl-job-title-class.field';
import jobTitleSubRoleField from 'src/fields/person/pdl-job-title-sub-role.field';
import seniorityField from 'src/fields/person/pdl-seniority.field';
import sexField from 'src/fields/person/pdl-sex.field';

type FieldOption = { id?: string; value: string };

const fieldOptions = (field: unknown): FieldOption[] => {
  const options = (field as { config?: { options?: FieldOption[] } }).config
    ?.options;
  return options ?? [];
};

const cases: {
  name: string;
  field: unknown;
  options: readonly SelectOptionMeta[];
}[] = [
  { name: 'pdlSeniority', field: seniorityField, options: SENIORITY_OPTIONS },
  { name: 'pdlJobRole', field: jobRoleField, options: JOB_ROLE_OPTIONS },
  {
    name: 'pdlJobTitleClass',
    field: jobTitleClassField,
    options: JOB_TITLE_CLASS_OPTIONS,
  },
  {
    name: 'pdlJobTitleSubRole',
    field: jobTitleSubRoleField,
    options: JOB_TITLE_SUB_ROLE_OPTIONS,
  },
  { name: 'pdlSex', field: sexField, options: SEX_OPTIONS },
  {
    name: 'pdlInferredSalary',
    field: inferredSalaryField,
    options: INFERRED_SALARY_OPTIONS,
  },
  {
    name: 'pdlCompanyType',
    field: companyTypeField,
    options: COMPANY_TYPE_OPTIONS,
  },
  {
    name: 'pdlLocationContinent',
    field: locationContinentField,
    options: LOCATION_CONTINENT_OPTIONS,
  },
  {
    name: 'pdlMicExchange',
    field: micExchangeField,
    options: MIC_EXCHANGE_OPTIONS,
  },
];

describe.each(cases)('$name options', ({ field, options }) => {
  it('resolves a universalIdentifier for every option', () => {
    expect(fieldOptions(field).every((option) => Boolean(option.id))).toBe(true);
  });

  it('exposes exactly the values from its source constant', () => {
    expect(fieldOptions(field).map((option) => option.value)).toEqual(
      options.map((option) => option.value),
    );
  });
});
