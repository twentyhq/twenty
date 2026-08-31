import { type EntityCustomField } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { asNonEmptyString } from 'src/logic-functions/utils/as-non-empty-string';
import { asObject } from 'src/logic-functions/utils/as-object';
import { buildSlackRecordRefField } from 'src/logic-functions/utils/build-slack-record-ref-field';
import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';

export const buildSlackCompanyRefField = ({
  company,
  workspaceBaseUrl,
}: {
  company: Record<string, unknown> | undefined;
  workspaceBaseUrl: string;
}): EntityCustomField | undefined => {
  const companyId = asNonEmptyString(company?.id);
  const companyName = asNonEmptyString(company?.name);

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
      asNonEmptyString(asObject(company?.domainName)?.primaryLinkUrl),
    ),
    workspaceBaseUrl,
  });
};
