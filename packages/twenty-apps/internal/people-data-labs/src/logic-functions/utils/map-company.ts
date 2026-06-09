import { COMPANY_TYPE_OPTIONS } from 'src/constants/company-type-options';
import { FUNDING_STAGE_OPTIONS } from 'src/constants/funding-stage-options';
import { INDUSTRY_OPTIONS } from 'src/constants/industry-options';
import { LOCATION_CONTINENT_OPTIONS } from 'src/constants/location-continent-options';
import { METRO_OPTIONS } from 'src/constants/metro-options';
import { MIC_EXCHANGE_OPTIONS } from 'src/constants/mic-exchange-options';
import { SIZE_OPTIONS } from 'src/constants/size-options';
import { toJsonArray } from 'src/logic-functions/utils/to-json-array';
import { toJsonObject } from 'src/logic-functions/utils/to-json-object';
import { toNumber } from 'src/logic-functions/utils/to-number';
import { toStringArray } from 'src/logic-functions/utils/to-string-array';
import { toText } from 'src/logic-functions/utils/to-text';
import { buildAddress } from 'src/logic-functions/utils/build-address';
import { buildCurrencyFromUsd } from 'src/logic-functions/utils/build-currency-from-usd';
import { buildLinks } from 'src/logic-functions/utils/build-links';
import { parsePartialDate } from 'src/logic-functions/utils/parse-partial-date';
import { buildAllowedValues } from 'src/logic-functions/utils/build-allowed-values';
import { pickMultiSelect } from 'src/logic-functions/utils/pick-multi-select';
import { pickSelect } from 'src/logic-functions/utils/pick-select';
import { sizeTransform } from 'src/logic-functions/utils/size-transform';
import { type MappedRecord } from 'src/types/mapped-record';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { pruneUndefined } from 'src/utils/prune-undefined';

const INDUSTRY_VALUES = buildAllowedValues(INDUSTRY_OPTIONS);
const COMPANY_TYPE_VALUES = buildAllowedValues(COMPANY_TYPE_OPTIONS);
const SIZE_VALUES = buildAllowedValues(SIZE_OPTIONS);
const METRO_VALUES = buildAllowedValues(METRO_OPTIONS);
const LOCATION_CONTINENT_VALUES = buildAllowedValues(LOCATION_CONTINENT_OPTIONS);
const MIC_EXCHANGE_VALUES = buildAllowedValues(MIC_EXCHANGE_OPTIONS);
const FUNDING_STAGE_VALUES = buildAllowedValues(FUNDING_STAGE_OPTIONS);

export const mapCompany = (data: PdlCompanyData): MappedRecord => {
  const location = data.location ?? {};

  const standard = pruneUndefined({
    name: toText(data.display_name) ?? toText(data.name),
    domainName: buildLinks({ url: data.website }),
    linkedinLink: buildLinks({ url: data.linkedin_url }),
    address: buildAddress({
      street1: location.street_address,
      street2: location.address_line_2,
      city: location.locality,
      postcode: location.postal_code,
      state: location.region,
      country: location.country,
      geo: location.geo,
    }),
  });

  const pdl = pruneUndefined({
    pdlId: toText(data.id),

    pdlIndustry: pickSelect({ raw: data.industry, allowedValues: INDUSTRY_VALUES }),
    pdlIndustryDetail: toText(data.industry_v2) ?? toText(data.industry),
    pdlCompanyType: pickSelect({
      raw: data.type,
      allowedValues: COMPANY_TYPE_VALUES,
    }),
    pdlSizeRange: pickSelect({
      raw: data.size,
      allowedValues: SIZE_VALUES,
      transform: sizeTransform,
    }),
    pdlLocationMetro: pickSelect({
      raw: location.metro,
      allowedValues: METRO_VALUES,
    }),
    pdlLocationContinent: pickSelect({
      raw: location.continent,
      allowedValues: LOCATION_CONTINENT_VALUES,
    }),
    pdlMicExchange: pickSelect({
      raw: data.mic_exchange,
      allowedValues: MIC_EXCHANGE_VALUES,
    }),

    pdlHeadline: toText(data.headline),
    pdlSummary: toText(data.summary),
    pdlTicker: toText(data.ticker),
    pdlLinkedinId: toText(data.linkedin_id),

    pdlEmployeeCount: toNumber(data.employee_count),
    pdlFoundedYear: toNumber(data.founded),
    pdlNumberFundingRounds: toNumber(data.number_funding_rounds),

    pdlTotalFunding: buildCurrencyFromUsd(data.total_funding_raised),
    pdlLatestFundingStage: pickSelect({
      raw: data.latest_funding_stage,
      allowedValues: FUNDING_STAGE_VALUES,
    }),
    pdlFundingStages: pickMultiSelect({
      raws: data.funding_stages,
      allowedValues: FUNDING_STAGE_VALUES,
    }),
    pdlLastFundingDate: parsePartialDate(data.last_funding_date),

    pdlTwitterUrl: buildLinks({ url: data.twitter_url }),
    pdlFacebookUrl: buildLinks({ url: data.facebook_url }),

    pdlTags: toStringArray(data.tags),
    pdlAlternativeNames: toStringArray(data.alternative_names),
    pdlAlternativeDomains: toStringArray(data.alternative_domains),
    pdlAffiliatedProfiles: toStringArray(data.profiles),

    pdlNaics: toJsonArray(data.naics),
    pdlSic: toJsonArray(data.sic),
    pdlEmployeeCountByCountry: toJsonObject(data.employee_count_by_country),
  });

  return { standard, pdl };
};
