import { type PartnerCookie } from '@/auth/types/PartnerCookie';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

export const isValidPartnerCookie = (payload: PartnerCookie) =>
  isDefined(payload.partner) &&
  normalizePartner(payload.partner) === payload.partner;
