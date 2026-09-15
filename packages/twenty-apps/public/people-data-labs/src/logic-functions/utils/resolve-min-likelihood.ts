const DEFAULT_MIN_LIKELIHOOD = 2;
const WEAK_IDENTIFIER_MIN_LIKELIHOOD = 6;

export const resolveMinLikelihood = ({
  inputMinLikelihood,
  hasStrongIdentifier,
}: {
  inputMinLikelihood: number | undefined;
  hasStrongIdentifier: boolean;
}): number =>
  inputMinLikelihood ??
  (hasStrongIdentifier ? DEFAULT_MIN_LIKELIHOOD : WEAK_IDENTIFIER_MIN_LIKELIHOOD);
