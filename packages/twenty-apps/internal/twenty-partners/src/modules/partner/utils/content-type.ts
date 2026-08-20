export const isCaseStudy = (
  contentType: ReadonlyArray<string | undefined> | string | null | undefined,
): boolean =>
  Array.isArray(contentType)
    ? contentType.includes('CASE_STUDY')
    : contentType === 'CASE_STUDY';

// A case study only counts once an admin approved it, so a draft never scores
// and never reaches the public profile.
export const isApprovedCaseStudy = (content: {
  contentType?: ReadonlyArray<string | undefined> | string | null;
  status?: string | null;
}): boolean =>
  isCaseStudy(content.contentType) && content.status === 'APPROVED';
