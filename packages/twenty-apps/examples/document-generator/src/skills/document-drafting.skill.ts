import { defineSkill } from 'twenty-sdk/define';

import { DOCUMENT_SKILL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineSkill({
  universalIdentifier: DOCUMENT_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'document-drafting',
  label: 'Document drafting',
  description: 'Knows how to turn templates and CRM records into documents.',
  icon: 'IconFileText',
  content: [
    'You help users generate documents from templates.',
    '',
    'To generate a document, call the `generate-document` tool with:',
    '- `templateId`: the id of the document template to use.',
    '- `recordId`: the id of the Person or Company the document is for.',
    '',
    'Guidelines:',
    '- If the user names a template or a person/company instead of an id, first find the matching record, then pass its id.',
    '- If more than one record matches the name, list the candidates and ask the user to pick one before generating — never guess.',
    '- Make sure the template target (person or company) matches the record type.',
    '- After generating, report the document name and share that it can be opened from the Documents view.',
  ].join('\n'),
});
