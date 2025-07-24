import { CONFIG_VARIABLE_ROW_ID_PREFIX } from '@/settings/admin-panel/config-variables/constants/ConfigVariableRowId';
import { lastVisitedConfigVariableState } from '@/settings/admin-panel/config-variables/states/lastVisitedConfigVariableState';
import { ScrollRestoreEffect } from '@/ui/utilities/scroll/components/ScrollRestoreEffect';

export const ConfigVariablesScrollRestoreEffect = () => {
  return (
    <ScrollRestoreEffect
      lastVisitedItemState={lastVisitedConfigVariableState}
      idPrefix={CONFIG_VARIABLE_ROW_ID_PREFIX}
    />
  );
};
