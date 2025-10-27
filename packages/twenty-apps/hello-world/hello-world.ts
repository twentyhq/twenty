import { ApplicationVariable, Application } from 'twenty-sdk';

@ApplicationVariable({
  universalIdentifier: 'dedc53eb-9c12-4fe2-ba86-4a2add19d305',
  key: 'TWENTY_API_KEY',
  description: 'Twenty API Key',
  isSecret: true,
})
@Application({
  universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
  displayName: 'Hello World',
  description: 'A simple hello world app',
})
export class HelloWorld {}
