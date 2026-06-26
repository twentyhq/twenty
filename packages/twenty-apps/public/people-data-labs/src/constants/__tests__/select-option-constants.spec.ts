import { describe, expect, it } from 'vitest';

import { COMPANY_TYPE_OPTIONS } from 'src/constants/company-type-options';
import { ENRICHMENT_STATUS_OPTIONS } from 'src/constants/enrichment-status-options';
import { FUNDING_STAGE_OPTIONS } from 'src/constants/funding-stage-options';
import { INDUSTRY_OPTIONS } from 'src/constants/industry-options';
import { INFERRED_SALARY_OPTIONS } from 'src/constants/inferred-salary-options';
import { JOB_ROLE_OPTIONS } from 'src/constants/job-role-options';
import { JOB_TITLE_CLASS_OPTIONS } from 'src/constants/job-title-class-options';
import { JOB_TITLE_SUB_ROLE_OPTIONS } from 'src/constants/job-title-sub-role-options';
import { LOCATION_CONTINENT_OPTIONS } from 'src/constants/location-continent-options';
import { METRO_OPTIONS } from 'src/constants/metro-options';
import { MIC_EXCHANGE_OPTIONS } from 'src/constants/mic-exchange-options';
import { SENIORITY_OPTIONS } from 'src/constants/seniority-options';
import { SEX_OPTIONS } from 'src/constants/sex-options';
import { SIZE_OPTIONS } from 'src/constants/size-options';
import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_LOGIC_FUNCTION_CONSTANTS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
  PDL_VIEW_UNIVERSAL_IDENTIFIERS
} from 'src/constants/universal-identifiers';
import { type SelectOptionMeta } from 'src/types/select-option-meta';
import { normalizeEnumValue } from 'src/utils/normalize-enum-value';

import companyEnrichmentStatusField from 'src/fields/company/pdl-enrichment-status.field';
import companyFundingStagesField from 'src/fields/company/pdl-funding-stages.field';
import companyIndustryField from 'src/fields/company/pdl-industry.field';
import companyLatestFundingStageField from 'src/fields/company/pdl-latest-funding-stage.field';
import companyLocationContinentField from 'src/fields/company/pdl-location-continent.field';
import companyLocationMetroField from 'src/fields/company/pdl-location-metro.field';
import companyMicExchangeField from 'src/fields/company/pdl-mic-exchange.field';
import companySizeRangeField from 'src/fields/company/pdl-size-range.field';
import companyTypeField from 'src/fields/company/pdl-company-type.field';
import personEnrichmentStatusField from 'src/fields/person/pdl-enrichment-status.field';
import personIndustryField from 'src/fields/person/pdl-industry.field';
import personInferredSalaryField from 'src/fields/person/pdl-inferred-salary.field';
import personJobRoleField from 'src/fields/person/pdl-job-role.field';
import personJobTitleClassField from 'src/fields/person/pdl-job-title-class.field';
import personJobTitleSubRoleField from 'src/fields/person/pdl-job-title-sub-role.field';
import personLocationMetroField from 'src/fields/person/pdl-location-metro.field';
import personSeniorityField from 'src/fields/person/pdl-seniority.field';
import personSexField from 'src/fields/person/pdl-sex.field';

type FieldOption = { id?: string; value: string };

const fieldOptions = (field: unknown): FieldOption[] =>
  (field as { config?: { options?: FieldOption[] } }).config?.options ?? [];

const selectFieldCases: {
  name: string;
  field: unknown;
  options: readonly SelectOptionMeta[];
}[] = [
  { name: 'person.pdlSeniority', field: personSeniorityField, options: SENIORITY_OPTIONS },
  { name: 'person.pdlJobRole', field: personJobRoleField, options: JOB_ROLE_OPTIONS },
  { name: 'person.pdlJobTitleClass', field: personJobTitleClassField, options: JOB_TITLE_CLASS_OPTIONS },
  { name: 'person.pdlJobTitleSubRole', field: personJobTitleSubRoleField, options: JOB_TITLE_SUB_ROLE_OPTIONS },
  { name: 'person.pdlSex', field: personSexField, options: SEX_OPTIONS },
  { name: 'person.pdlInferredSalary', field: personInferredSalaryField, options: INFERRED_SALARY_OPTIONS },
  { name: 'person.pdlIndustry', field: personIndustryField, options: INDUSTRY_OPTIONS },
  { name: 'person.pdlLocationMetro', field: personLocationMetroField, options: METRO_OPTIONS },
  { name: 'person.pdlEnrichmentStatus', field: personEnrichmentStatusField, options: ENRICHMENT_STATUS_OPTIONS },
  { name: 'company.pdlCompanyType', field: companyTypeField, options: COMPANY_TYPE_OPTIONS },
  { name: 'company.pdlLocationContinent', field: companyLocationContinentField, options: LOCATION_CONTINENT_OPTIONS },
  { name: 'company.pdlMicExchange', field: companyMicExchangeField, options: MIC_EXCHANGE_OPTIONS },
  { name: 'company.pdlIndustry', field: companyIndustryField, options: INDUSTRY_OPTIONS },
  { name: 'company.pdlLocationMetro', field: companyLocationMetroField, options: METRO_OPTIONS },
  { name: 'company.pdlSizeRange', field: companySizeRangeField, options: SIZE_OPTIONS },
  { name: 'company.pdlLatestFundingStage', field: companyLatestFundingStageField, options: FUNDING_STAGE_OPTIONS },
  { name: 'company.pdlFundingStages', field: companyFundingStagesField, options: FUNDING_STAGE_OPTIONS },
  { name: 'company.pdlEnrichmentStatus', field: companyEnrichmentStatusField, options: ENRICHMENT_STATUS_OPTIONS },
];

describe.each(selectFieldCases)('$name options', ({ field, options }) => {
  it('resolves a universalIdentifier for every option', () => {
    expect(fieldOptions(field).every((option) => Boolean(option.id))).toBe(true);
  });

  it('exposes exactly the values from its source constant', () => {
    expect(fieldOptions(field).map((option) => option.value)).toEqual(
      options.map((option) => option.value),
    );
  });

  it('uses option values that are normalizeEnumValue fixed points', () => {
    for (const option of fieldOptions(field)) {
      expect(normalizeEnumValue(option.value)).toBe(option.value);
    }
  });

  it('has option ids that are unique within the field', () => {
    const ids = fieldOptions(field).map((option) => option.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('select fields collectively', () => {
  it('never reuses an option id across two different fields', () => {
    const everyOptionId = selectFieldCases.flatMap(({ field }) =>
      fieldOptions(field).map((option) => option.id),
    );

    expect(new Set(everyOptionId).size).toBe(everyOptionId.length);
  });
});

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const collectUuids = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(collectUuids);
  }
  return [];
};

describe('universal-identifier registry', () => {
  const registryUuids = collectUuids([
    APPLICATION_UNIVERSAL_IDENTIFIER,
    DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
    PDL_LOGIC_FUNCTION_CONSTANTS,
    PDL_FIELD_UNIVERSAL_IDENTIFIERS,
    PDL_VIEW_UNIVERSAL_IDENTIFIERS,
    PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
  ]);

  it('contains only valid v4 UUIDs', () => {
    expect(registryUuids.filter((uuid) => !UUID_V4_REGEX.test(uuid))).toEqual(
      [],
    );
  });

  it('contains no duplicate UUIDs across the whole registry', () => {
    expect(new Set(registryUuids).size).toBe(registryUuids.length);
  });
});
