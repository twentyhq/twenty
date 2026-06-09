import { INDUSTRY_OPTIONS } from 'src/constants/industry-options';
import { SIZE_OPTIONS } from 'src/constants/size-options';
import { buildAllowedValues } from 'src/logic-functions/utils/build-allowed-values';
import { buildLinks } from 'src/logic-functions/utils/build-links';
import { normalizeDomain } from 'src/logic-functions/utils/normalize-domain';
import { normalizeLinkedinUrl } from 'src/logic-functions/utils/normalize-linkedin-url';
import { pickSelect } from 'src/logic-functions/utils/pick-select';
import { sizeTransform } from 'src/logic-functions/utils/size-transform';
import { toText } from 'src/logic-functions/utils/to-text';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { pruneUndefined } from 'src/utils/prune-undefined';

const INDUSTRY_VALUES = buildAllowedValues(INDUSTRY_OPTIONS);
const SIZE_VALUES = buildAllowedValues(SIZE_OPTIONS);

export const buildCompanyCreateData = (
  data: PdlPersonData,
): Record<string, unknown> =>
  pruneUndefined<unknown>({
    name: toText(data.job_company_name),
    domainName: buildLinks({ url: normalizeDomain(data.job_company_website) }),
    linkedinLink: buildLinks({
      url: normalizeLinkedinUrl(data.job_company_linkedin_url),
    }),
    pdlId: toText(data.job_company_id),
    pdlIndustry: pickSelect({
      raw: data.job_company_industry,
      allowedValues: INDUSTRY_VALUES,
    }),
    pdlSizeRange: pickSelect({
      raw: data.job_company_size,
      allowedValues: SIZE_VALUES,
      transform: sizeTransform,
    }),
  });
