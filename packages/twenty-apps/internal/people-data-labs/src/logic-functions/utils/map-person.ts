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

export const mapPerson = (personData: PdlPersonData): MappedRecord => {
  const emailEntries = (personData.emails ?? []).map((rawEmail) =>
    isString(rawEmail) ? rawEmail : rawEmail.address,
  );

  const standard = pruneUndefined({
    name: buildFullName({
      firstName: personData.first_name,
      lastName: personData.last_name,
      fullName: personData.full_name,
    }),
    emails: buildEmails([
      personData.work_email,
      personData.recommended_personal_email,
      ...(personData.personal_emails ?? []),
      ...emailEntries,
    ]),
    phones: buildPhones([personData.mobile_phone, ...(personData.phone_numbers ?? [])]),
    jobTitle: toText(personData.job_title),
    linkedinLink: buildLinks({ url: personData.linkedin_url }),
  });

  const pdl = pruneUndefined({
    pdlId: toText(personData.id),

    pdlSeniority: pickMultiSelect({
      rawValues: personData.job_title_levels,
      allowedValues: SENIORITY_VALUES,
    }),
    pdlJobRole: pickSelect({
      raw: personData.job_title_role,
      allowedValues: JOB_ROLE_VALUES,
    }),
    pdlJobTitleClass: pickSelect({
      raw: personData.job_title_class,
      allowedValues: JOB_TITLE_CLASS_VALUES,
    }),
    pdlJobTitleSubRole: pickSelect({
      raw: personData.job_title_sub_role,
      allowedValues: JOB_TITLE_SUB_ROLE_VALUES,
    }),
    pdlIndustry: pickSelect({
      raw: personData.industry,
      allowedValues: INDUSTRY_VALUES,
    }),
    pdlInferredSalary: pickSelect({
      raw: personData.inferred_salary,
      allowedValues: INFERRED_SALARY_VALUES,
      transform: salaryTransform,
    }),
    pdlSex: pickSelect({ raw: personData.sex, allowedValues: SEX_VALUES }),
    pdlLocationMetro: pickSelect({
      raw: personData.location_metro,
      allowedValues: METRO_VALUES,
    }),

    pdlHeadline: toText(personData.headline),
    pdlSummary: toText(personData.summary),
    pdlJobSummary: toText(personData.job_summary),
    pdlJobOnetCode: toText(personData.job_onet_code),
    pdlLinkedinUsername: toText(personData.linkedin_username),

    pdlYearsExperience: toNumber(personData.inferred_years_experience),
    pdlLinkedinConnections: toNumber(personData.linkedin_connections),
    pdlBirthYear: toNumber(personData.birth_year),

    pdlBirthDate: parsePartialDate(personData.birth_date),
    pdlJobStartDate: parsePartialDate(personData.job_start_date),

    pdlGithubUrl: buildLinks({ url: personData.github_url }),
    pdlTwitterUrl: buildLinks({ url: personData.twitter_url }),
    pdlFacebookUrl: buildLinks({ url: personData.facebook_url }),

    pdlSkills: toStringArray(personData.skills),
    pdlInterests: toStringArray(personData.interests),
    pdlNameAliases: toStringArray(personData.name_aliases),

    pdlExperience: toJsonArray(personData.experience),
    pdlEducation: toJsonArray(personData.education),
    pdlCertifications: toJsonArray(personData.certifications),
    pdlProfiles: toJsonArray(personData.profiles),
    pdlLanguages: toJsonArray(personData.languages),

    pdlLocation: buildAddress({
      street1: personData.location_street_address,
      street2: personData.location_address_line_2,
      city: personData.location_locality,
      postcode: personData.location_postal_code,
      state: personData.location_region,
      country: personData.location_country,
      geo: personData.location_geo,
    }),
  });

  return { standard, pdl };
};
