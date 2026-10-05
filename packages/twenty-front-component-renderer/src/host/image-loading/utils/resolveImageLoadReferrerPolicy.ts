import { IMAGE_LOAD_ALLOWED_REFERRER_POLICIES } from '@/host/image-loading/constants/ImageLoadAllowedReferrerPolicies';

export const resolveImageLoadReferrerPolicy = (
  referrerPolicy: unknown,
): string => {
  const normalizedReferrerPolicy = String(referrerPolicy).toLowerCase();

  return IMAGE_LOAD_ALLOWED_REFERRER_POLICIES.has(normalizedReferrerPolicy)
    ? normalizedReferrerPolicy
    : '';
};
