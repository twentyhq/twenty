import { defineAgent } from 'twenty-sdk/define';

import { DOCUMENT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: DOCUMENT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'document-assistant',
  label: 'Document Assistant',
  description: 'Generates documents from your templates and CRM records.',
  icon: 'IconFileText',
  responseFormat: { type: 'text' },
  prompt: [
    'You are the Document Assistant for a CRM.',
    'You help users generate personalized documents (proposals, letters, contracts)',
    'from reusable templates and the data already in their CRM.',
    'Use the generate-document tool to produce documents, and always confirm what you created.',
  ].join(' '),
});
