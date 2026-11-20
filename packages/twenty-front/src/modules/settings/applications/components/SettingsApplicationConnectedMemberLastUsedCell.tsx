import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { type SettingsApplicationConnectedMember } from '@/settings/applications/types/SettingsApplicationConnectedMember';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

export const SettingsApplicationConnectedMemberLastUsedCell = ({
  item: connectedMember,
}: {
  item: SettingsApplicationConnectedMember;
}) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  return beautifyPastDateRelativeToNow(
    connectedMember.lastUsedAt,
    localeCatalog,
  );
};
