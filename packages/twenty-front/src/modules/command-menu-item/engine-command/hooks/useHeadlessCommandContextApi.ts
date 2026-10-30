import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useHeadlessCommandContextApi = () => {
  const engineCommandId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const headlessCommandContextApis = useAtomStateValue(
    headlessCommandContextApisState,
  );
  const headlessCommandContextApi =
    headlessCommandContextApis.get(engineCommandId);

  if (!isDefined(headlessCommandContextApi)) {
    throw new Error(
      doNotTranslate(
        'Headless command context API not found. Make sure the command was mounted via the command mount flow.',
      ),
    );
  }

  return headlessCommandContextApi;
};
