import { type ViewFamilyLoadOutcome } from '@/metadata-store/types/ViewFamilyLoadOutcome';
import { isDefined } from 'twenty-shared/utils';

export const resolveViewFamilyLoadOutcome = ({
  familyVersions,
  hasEpochChanged,
  hint,
}: {
  familyVersions: string[];
  hasEpochChanged: boolean;
  hint: string | undefined;
}): ViewFamilyLoadOutcome => {
  const [firstFamilyVersion, ...otherFamilyVersions] = familyVersions;

  if (
    !isDefined(firstFamilyVersion) ||
    hasEpochChanged ||
    otherFamilyVersions.some(
      (familyVersion) => familyVersion !== firstFamilyVersion,
    )
  ) {
    return { type: 'mismatch' };
  }

  if (hint === firstFamilyVersion) {
    return { type: 'commit', familyVersion: firstFamilyVersion };
  }

  return { type: 'confirm-hint', familyVersion: firstFamilyVersion };
};
