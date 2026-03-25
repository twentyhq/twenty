import { AUTO_SET_HEADER_KEYS } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/AutoSetHeaderKeys';

export const isAutoSetHeaderKey = (key: string): boolean => {
  return AUTO_SET_HEADER_KEYS.includes(key.trim().toLowerCase());
};
