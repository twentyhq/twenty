import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import companyLastContactAtField from 'src/fields/company-last-contact-at.field';
import lastContactAtField from 'src/fields/last-contact-at.field';
import lastContactByField from 'src/fields/last-contact-by.field';
import lastEmailField from 'src/fields/last-email.field';
import lastInboundAtField from 'src/fields/last-inbound-at.field';
import lastMeetingField from 'src/fields/last-meeting.field';
import lastOutboundAtField from 'src/fields/last-outbound-at.field';
import opportunityLastContactAtField from 'src/fields/opportunity-last-contact-at.field';

export const INDEX_VIEW_FIELDS = [
  {
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
    objectLabelPlural: 'People',
    fields: [
      lastContactAtField,
      lastOutboundAtField,
      lastInboundAtField,
      lastContactByField,
      lastEmailField,
      lastMeetingField,
    ].map(({ config }) => config),
  },
  {
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
    objectLabelPlural: 'Companies',
    fields: [companyLastContactAtField.config],
  },
  {
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    objectLabelPlural: 'Opportunities',
    fields: [opportunityLastContactAtField.config],
  },
];
