import { v4 as uuidv4 } from 'uuid';

export const getSharingRuleBaseFile = ({ name }: { name: string }) =>
  `import {
  defineSharingRule,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineSharingRule({
  universalIdentifier: '${uuidv4()}',
  name: '${name}',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  granteePrincipalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
});
`;
