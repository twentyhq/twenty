import { isString } from '@sniptt/guards';

import { INDUSTRY_OPTIONS } from 'src/constants/industry-options';
import { INFERRED_SALARY_OPTIONS } from 'src/constants/inferred-salary-options';
import { JOB_ROLE_OPTIONS } from 'src/constants/job-role-options';
import { JOB_TITLE_CLASS_OPTIONS } from 'src/constants/job-title-class-options';
import { JOB_TITLE_SUB_ROLE_OPTIONS } from 'src/constants/job-title-sub-role-options';
import { METRO_OPTIONS } from 'src/constants/metro-options';
import { SENIORITY_OPTIONS } from 'src/constants/seniority-options';
import { SEX_OPTIONS } from 'src/constants/sex-options';
import { toJsonArray } from 'src/logic-functions/utils/to-json-array';
import { toNumber } from 'src/logic-functions/utils/to-number';
import { toStringArray } from 'src/logic-functions/utils/to-string-array';
import { toText } from 'src/logic-functions/utils/to-text';
import { buildAddress } from 'src/logic-functions/utils/build-address';
import { buildEmails } from 'src/logic-functions/utils/build-emails';
import { buildFullName } from 'src/logic-functions/utils/build-full-name';
import { buildLinks } from 'src/logic-functions/utils/build-links';
import { buildPhones } from 'src/logic-functions/utils/build-phones';
import { parsePartialDate } from 'src/logic-functions/utils/parse-partial-date';
import { buildAllowedValues } from 'src/logic-functions/utils/build-allowed-values';
import { pickMultiSelect } from 'src/logic-functions/utils/pick-multi-select';
import { pickSelect } from 'src/logic-functions/utils/pick-select';
import { salaryTransform } from 'src/logic-functions/utils/salary-transform';
import { type MappedRecord } from 'src/types/mapped-record';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { pruneUndefined } from 'src/utils/prune-undefined';

const SENIORITY_VALUES = buildAllowedValues(SENIORITY_OPTIONS);
const JOB_ROLE_VALUES = buildAllowedValues(JOB_ROLE_OPTIONS);
const JOB_TITLE_CLASS_VALUES = buildAllowedValues(JOB_TITLE_CLASS_OPTIONS);
const JOB_TITLE_SUB_ROLE_VALUES = buildAllowedValues(JOB_TITLE_SUB_ROLE_OPTIONS);
const INDUSTRY_VALUES = buildAllowedValues(INDUSTRY_OPTIONS);
const INFERRED_SALARY_VALUES = buildAllowedValues(INFERRED_SALARY_OPTIONS);
const SEX_VALUES = buildAllowedValues(SEX_OPTIONS);
const METRO_VALUES = buildAllowedValues(METRO_OPTIONS);

export const mapPerson = (data: PdlPersonData): MappedRecord => {
  const emailEntries = (data.emails ?? []).map((entry) =>
    isString(entry) ? entry : entry.address,
  );

  const standard = pruneUndefined({
    name: buildFullName({
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: data.full_name,
    }),
    emails: buildEmails([
      data.work_email,
      data.recommended_personal_email,
      ...(data.personal_emails ?? []),
      ...emailEntries,
    ]),
    phones: buildPhones([data.mobile_phone, ...(data.phone_numbers ?? [])]),
    jobTitle: toText(data.job_title),
    linkedinLink: buildLinks({ url: data.linkedin_url }),
  });

  const pdl = pruneUndefined({
    pdlId: toText(data.id),

    pdlSeniority: pickMultiSelect({
      raws: data.job_title_levels,
      allowedValues: SENIORITY_VALUES,
    }),
    pdlJobRole: pickSelect({
      raw: data.job_title_role,
      allowedValues: JOB_ROLE_VALUES,
    }),
    pdlJobTitleClass: pickSelect({
      raw: data.job_title_class,
      allowedValues: JOB_TITLE_CLASS_VALUES,
    }),
    pdlJobTitleSubRole: pickSelect({
      raw: data.job_title_sub_role,
      allowedValues: JOB_TITLE_SUB_ROLE_VALUES,
    }),
    pdlIndustry: pickSelect({
      raw: data.industry,
      allowedValues: INDUSTRY_VALUES,
    }),
    pdlInferredSalary: pickSelect({
      raw: data.inferred_salary,
      allowedValues: INFERRED_SALARY_VALUES,
      transform: salaryTransform,
    }),
    pdlSex: pickSelect({ raw: data.sex, allowedValues: SEX_VALUES }),
    pdlLocationMetro: pickSelect({
      raw: data.location_metro,
      allowedValues: METRO_VALUES,
    }),

    pdlHeadline: toText(data.headline),
    pdlSummary: toText(data.summary),
    pdlJobSummary: toText(data.job_summary),
    pdlJobOnetCode: toText(data.job_onet_code),
    pdlLinkedinUsername: toText(data.linkedin_username),

    pdlYearsExperience: toNumber(data.inferred_years_experience),
    pdlLinkedinConnections: toNumber(data.linkedin_connections),
    pdlBirthYear: toNumber(data.birth_year),

    pdlBirthDate: parsePartialDate(data.birth_date),
    pdlJobStartDate: parsePartialDate(data.job_start_date),

    pdlGithubUrl: buildLinks({ url: data.github_url }),
    pdlTwitterUrl: buildLinks({ url: data.twitter_url }),
    pdlFacebookUrl: buildLinks({ url: data.facebook_url }),

    pdlSkills: toStringArray(data.skills),
    pdlInterests: toStringArray(data.interests),
    pdlNameAliases: toStringArray(data.name_aliases),

    pdlExperience: toJsonArray(data.experience),
    pdlEducation: toJsonArray(data.education),
    pdlCertifications: toJsonArray(data.certifications),
    pdlProfiles: toJsonArray(data.profiles),
    pdlLanguages: toJsonArray(data.languages),

    pdlLocation: buildAddress({
      street1: data.location_street_address,
      street2: data.location_address_line_2,
      city: data.location_locality,
      postcode: data.location_postal_code,
      state: data.location_region,
      country: data.location_country,
      geo: data.location_geo,
    }),
  });

  return { standard, pdl };
};
