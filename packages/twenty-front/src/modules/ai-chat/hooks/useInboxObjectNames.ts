import { inboxObjectNamesSelector } from '@/ai-chat/states/selectors/inboxObjectNamesSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxObjectNames = () =>
  useAtomStateValue(inboxObjectNamesSelector);
