import {
  PRE_REVIEW_VERDICT_RANK,
  type PreReviewVerdict,
} from 'src/modules/partner/pre-review/constants/pre-review-verdict.constant';

const CAP_WITHOUT_VERIFIABLE_PROOF: PreReviewVerdict = 'WORTH_A_LOOK';

// Nothing machine-checkable means the reviewer, not the model, decides whether
// this is a strong application. The cap only lowers a verdict, never raises one.
export const applyVerdictCap = ({
  verdict,
  hasVerifiableProof,
}: {
  verdict: PreReviewVerdict;
  hasVerifiableProof: boolean;
}): PreReviewVerdict => {
  if (hasVerifiableProof) return verdict;

  return PRE_REVIEW_VERDICT_RANK[verdict] <
    PRE_REVIEW_VERDICT_RANK[CAP_WITHOUT_VERIFIABLE_PROOF]
    ? CAP_WITHOUT_VERIFIABLE_PROOF
    : verdict;
};
