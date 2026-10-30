import { salesfarceIsActiveState } from '@/salesfarce/states/salesfarceIsActiveState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const salesfarceLoadStyles = async () => {
  if (!jotaiStore.get(salesfarceIsActiveState.atom)) {
    return;
  }

  await import('@/salesfarce/styles/salesfarce.css');
};
