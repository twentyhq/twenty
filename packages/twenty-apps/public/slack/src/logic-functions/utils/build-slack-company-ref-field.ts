import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildSlackRecordRefField } from 'src/logic-functions/utils/build-slack-record-ref-field';
import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

export const buildSlackCompanyRefField = ({
  company,
  workspaceBaseUrl,
}: {
  company: Record<string, unknown> | undefined;
  workspaceBaseUrl: string;
}): EntityCustomField | undefined => {
  const companyId = readOptionalString(company?.id);
  const companyName = readOptionalString(company?.name);

  if (!isDefined(companyId) || !isDefined(companyName)) {
    return undefined;
  }

  return buildSlackRecordRefField({
    key: 'company',
    label: 'Company',
    objectNameSingular: 'company',
    recordId: companyId,
    title: companyName,
    iconUrl: getCompanyLogoUrl(
      readOptionalString(asRecord(company?.domainName)?.primaryLinkUrl),
    ),
    workspaceBaseUrl,
  });
};
