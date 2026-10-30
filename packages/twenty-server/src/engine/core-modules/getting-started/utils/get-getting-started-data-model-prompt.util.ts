import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

export const getGettingStartedDataModelPrompt = (
  companyEnrichment: WorkspaceCompanyEnrichment | null,
): MessageDescriptor => {
  const companyName = companyEnrichment?.name;
  const industry = companyEnrichment?.industry;

  if (isNonEmptyString(companyName) && isNonEmptyString(industry)) {
    return msg`We're ${companyName}, a company in ${industry}. Look at the data I imported and suggest the objects, fields and views we need to run our business. Ask me before creating anything.`;
  }

  return msg`Look at the data I imported and suggest the objects, fields and views I need to run my business. Ask me what I want to track before creating anything.`;
};
