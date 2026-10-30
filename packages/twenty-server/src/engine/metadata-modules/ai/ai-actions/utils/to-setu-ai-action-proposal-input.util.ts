import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type SetuAiActionPolicyProposal } from 'src/engine/core-modules/tool-provider/types/setu-ai-action-policy.type';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';
import { type SetuAiActionProposalInput } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-proposal-input.type';

const HTML_TAG_PATTERN = /<[^>]+>/g;

// Maps a native send_email or update_<object> call onto a proposal. Only
// plain personal emails without attachments are supported in this release.
export const toSetuAiActionProposalInput = (
  proposal: SetuAiActionPolicyProposal,
): SetuAiActionProposalInput => {
  const args = proposal.arguments;

  if (proposal.kind === 'send_email') {
    const recipients = isPlainObject(args.recipients) ? args.recipients : {};
    const files = Array.isArray(args.files) ? args.files : [];

    if (files.length > 0 || !isString(args.body)) {
      throw new SetuAiActionException(
        'Use a plain-text body without attachments',
        'UNSUPPORTED_ACTION',
      );
    }

    return {
      kind: 'send_email',
      sendEmail: {
        to: isString(recipients.to) ? recipients.to : '',
        cc: isString(recipients.cc) ? recipients.cc : '',
        bcc: isString(recipients.bcc) ? recipients.bcc : '',
        subject: isString(args.subject) ? args.subject : '',
        body: args.body.replace(HTML_TAG_PATTERN, ' ').replace(/[ \t]+/g, ' '),
        ...(isNonEmptyString(args.connectedAccountId) && {
          connectedAccountId: args.connectedAccountId,
        }),
      },
    };
  }

  const { id, ...fields } = args;

  return {
    kind: 'update_record_fields',
    updateRecordFields: {
      objectNameSingular: proposal.objectNameSingular,
      recordId: isString(id) ? id : '',
      fields: Object.fromEntries(
        Object.entries(fields).filter(([, value]) => isDefined(value)),
      ),
    },
  };
};
