import { isNonEmptyString } from '@sniptt/guards';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

// '' is the unset sentinel both variable tables encode in their @Check
// constraint, and it is what `isFilled` and the required check read. Encrypting
// an empty value would produce a real envelope that wrongly reads as filled.
export const encryptApplicationVariableValue = ({
  plainTextValue,
  secretEncryptionService,
  workspaceId,
}: {
  plainTextValue: PlaintextString;
  secretEncryptionService: SecretEncryptionService;
  workspaceId?: string;
}): EncryptedString | '' =>
  isNonEmptyString(plainTextValue)
    ? secretEncryptionService.encryptVersioned(plainTextValue, { workspaceId })
    : '';
