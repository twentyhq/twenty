export const isCaseStudy = (
  contentType: ReadonlyArray<string | undefined> | string | null | undefined,
): boolean =>
  Array.isArray(contentType)
    ? contentType.includes('CASE_STUDY')
    : contentType === 'CASE_STUDY';
