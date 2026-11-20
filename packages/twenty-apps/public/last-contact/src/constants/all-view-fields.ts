import {
  COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_OBJECT_UNIVERSAL_IDENTIFIER,
  PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import companyLastContactAtField from 'src/fields/company-last-contact-at.field';
import lastContactAtField from 'src/fields/last-contact-at.field';
import lastContactByField from 'src/fields/last-contact-by.field';
import lastEmailField from 'src/fields/last-email.field';
import lastInboundAtField from 'src/fields/last-inbound-at.field';
import lastMeetingField from 'src/fields/last-meeting.field';
import lastOutboundAtField from 'src/fields/last-outbound-at.field';
import opportunityLastContactAtField from 'src/fields/opportunity-last-contact-at.field';

export const ALL_VIEW_FIELDS = [
  {
    objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
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
    objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    objectLabelPlural: 'Companies',
    fields: [companyLastContactAtField.config],
  },
  {
    objectUniversalIdentifier: OPPORTUNITY_OBJECT_UNIVERSAL_IDENTIFIER,
    objectLabelPlural: 'Opportunities',
    fields: [opportunityLastContactAtField.config],
  },
];
