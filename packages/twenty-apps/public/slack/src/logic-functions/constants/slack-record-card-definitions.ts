import { type SlackRecordCardDefinition } from 'src/logic-functions/types/slack-record-card-definition.type';
import { type SlackRecordNode } from 'src/logic-functions/types/slack-record-node.type';
import { formatSlackRecordCurrency } from 'src/logic-functions/utils/format-slack-record-currency';
import { formatSlackRecordDate } from 'src/logic-functions/utils/format-slack-record-date';
import { formatSlackRecordDomain } from 'src/logic-functions/utils/format-slack-record-domain';
import { formatSlackRecordEnumLabel } from 'src/logic-functions/utils/format-slack-record-enum-label';
import { formatSlackRecordFullName } from 'src/logic-functions/utils/format-slack-record-full-name';
import { readSlackRecordProperty } from 'src/logic-functions/utils/read-slack-record-property';
import { readSlackRecordText } from 'src/logic-functions/utils/read-slack-record-text';

const keepDefinedDetails = (details: (string | undefined)[]): string[] =>
  details.filter((detail): detail is string => detail !== undefined);

const FULL_NAME_SELECTION = { firstName: true, lastName: true };

export const SLACK_RECORD_CARD_DEFINITIONS: Record<
  string,
  SlackRecordCardDefinition
> = {
  person: {
    objectNamePlural: 'people',
    objectLabel: 'Person',
    nodeSelection: {
      id: true,
      name: FULL_NAME_SELECTION,
      jobTitle: true,
      emails: { primaryEmail: true },
      company: { name: true },
    },
    nameOnlyNodeSelection: { id: true, name: FULL_NAME_SELECTION },
    getRecordName: (node: SlackRecordNode) =>
      formatSlackRecordFullName(node.name),
    getDetails: (node: SlackRecordNode) =>
      keepDefinedDetails([
        readSlackRecordText(node.jobTitle),
        readSlackRecordText(readSlackRecordProperty(node.company, 'name')),
        readSlackRecordText(
          readSlackRecordProperty(node.emails, 'primaryEmail'),
        ),
      ]),
  },
  company: {
    objectNamePlural: 'companies',
    objectLabel: 'Company',
    nodeSelection: {
      id: true,
      name: true,
      domainName: { primaryLinkUrl: true },
      annualRevenue: { amountMicros: true, currencyCode: true },
      address: { addressCity: true },
    },
    nameOnlyNodeSelection: { id: true, name: true },
    getRecordName: (node: SlackRecordNode) => readSlackRecordText(node.name),
    getDetails: (node: SlackRecordNode) =>
      keepDefinedDetails([
        formatSlackRecordDomain(node.domainName),
        formatSlackRecordCurrency(node.annualRevenue),
        readSlackRecordText(
          readSlackRecordProperty(node.address, 'addressCity'),
        ),
      ]),
  },
  opportunity: {
    objectNamePlural: 'opportunities',
    objectLabel: 'Opportunity',
    nodeSelection: {
      id: true,
      name: true,
      amount: { amountMicros: true, currencyCode: true },
      stage: true,
      closeDate: true,
      company: { name: true },
    },
    nameOnlyNodeSelection: { id: true, name: true },
    getRecordName: (node: SlackRecordNode) => readSlackRecordText(node.name),
    getDetails: (node: SlackRecordNode) =>
      keepDefinedDetails([
        formatSlackRecordCurrency(node.amount),
        formatSlackRecordEnumLabel(node.stage),
        readSlackRecordText(readSlackRecordProperty(node.company, 'name')),
      ]),
  },
  task: {
    objectNamePlural: 'tasks',
    objectLabel: 'Task',
    nodeSelection: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
      assignee: { name: FULL_NAME_SELECTION },
    },
    nameOnlyNodeSelection: { id: true, title: true },
    getRecordName: (node: SlackRecordNode) => readSlackRecordText(node.title),
    getDetails: (node: SlackRecordNode) => {
      const dueDate = formatSlackRecordDate(node.dueAt);

      return keepDefinedDetails([
        formatSlackRecordEnumLabel(node.status),
        dueDate === undefined ? undefined : `Due ${dueDate}`,
        formatSlackRecordFullName(
          readSlackRecordProperty(node.assignee, 'name'),
        ),
      ]);
    },
  },
  note: {
    objectNamePlural: 'notes',
    objectLabel: 'Note',
    nodeSelection: { id: true, title: true, createdAt: true },
    nameOnlyNodeSelection: { id: true, title: true },
    getRecordName: (node: SlackRecordNode) => readSlackRecordText(node.title),
    getDetails: (node: SlackRecordNode) => {
      const createdDate = formatSlackRecordDate(node.createdAt);

      return keepDefinedDetails([
        createdDate === undefined ? undefined : `Created ${createdDate}`,
      ]);
    },
  },
};
