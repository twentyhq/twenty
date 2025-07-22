import { CONFIG_VARIABLE_ROW_ID_PREFIX } from '@/settings/admin-panel/config-variables/constants/ConfigVariableRowId';
import { lastVisitedConfigVariableState } from '@/settings/admin-panel/config-variables/states/lastVisitedConfigVariableState';
import { showHiddenGroupVariablesState } from '@/settings/admin-panel/config-variables/states/showHiddenGroupVariablesState';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ConfigVariablesGroupData } from '~/generated-metadata/graphql';

type ConfigVariablesScrollRestoreEffectProps = {
  configVariableGroups: ConfigVariablesGroupData[];
};

export const ConfigVariablesScrollRestoreEffect = ({
  configVariableGroups,
}: ConfigVariablesScrollRestoreEffectProps) => {
  const [lastVisitedConfigVariable, setLastVisitedConfigVariable] =
    useRecoilState(lastVisitedConfigVariableState);
  const setShowHiddenGroupVariables = useSetRecoilState(
    showHiddenGroupVariablesState,
  );

  useEffect(() => {
    if (isNonEmptyString(lastVisitedConfigVariable)) {
      const targetGroup = configVariableGroups.find((group) =>
        group.variables.some(
          (variable) => variable.name === lastVisitedConfigVariable,
        ),
      );

      if (targetGroup?.isHiddenOnLoad === true) {
        setShowHiddenGroupVariables(true);
      }

      const variableRowElement = document.getElementById(
        `${CONFIG_VARIABLE_ROW_ID_PREFIX}-${lastVisitedConfigVariable}`,
      );

      if (variableRowElement !== null) {
        variableRowElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        setLastVisitedConfigVariable(null);
      }
    }
  }, [
    lastVisitedConfigVariable,
    configVariableGroups,
    setLastVisitedConfigVariable,
    setShowHiddenGroupVariables,
  ]);

  return <></>;
};
