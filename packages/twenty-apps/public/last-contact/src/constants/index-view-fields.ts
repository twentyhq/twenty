import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  COMPANY_LAST_CONTACT_ITEM_MORPH_ID,
  OPPORTUNITY_LAST_CONTACT_ITEM_MORPH_ID,
} from 'src/constants/universal-identifiers';
import companyLastContactAtField from 'src/fields/company-last-contact-at.field';
import lastContactAtField from 'src/fields/last-contact-at.field';
import lastContactByField from 'src/fields/last-contact-by.field';
import lastEmailField from 'src/fields/last-email.field';
import lastInboundAtField from 'src/fields/last-inbound-at.field';
import lastMeetingField from 'src/fields/last-meeting.field';
import lastOutboundAtField from 'src/fields/last-outbound-at.field';
import opportunityLastContactAtField from 'src/fields/opportunity-last-contact-at.field';

export type IndexViewField = {
  universalIdentifier: string;
  label: string;
  name: string;
};

export type IndexViewFields = {
  objectUniversalIdentifier: string;
  objectLabelPlural: string;
  fields: IndexViewField[];
};

// Views show a morph relation through its head field, whose universal identifier is the morph id.
const buildLastContactItemField = (morphId: string): IndexViewField => ({
  universalIdentifier: morphId,
  label: 'Last contact item',
  name: 'lastContactItem',
});

export const INDEX_VIEW_FIELDS: IndexViewFields[] = [
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
    fields: [
      companyLastContactAtField.config,
      buildLastContactItemField(COMPANY_LAST_CONTACT_ITEM_MORPH_ID),
    ],
  },
  {
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    objectLabelPlural: 'Opportunities',
    fields: [
      opportunityLastContactAtField.config,
      buildLastContactItemField(OPPORTUNITY_LAST_CONTACT_ITEM_MORPH_ID),
    ],
  },
];
