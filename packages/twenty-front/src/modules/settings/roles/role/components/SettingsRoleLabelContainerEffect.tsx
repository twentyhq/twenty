import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { titleInputComponentState } from '@/ui/input/states/titleInputComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export const SettingsRoleLabelContainerEffect = ({
  roleId,
}: {
  roleId: string;
}) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );
  const titleInputInstanceId = `settings-role-label-${roleId}`;

  const [isTitleInputOpen, setIsTitleInputOpen] = useRecoilComponentStateV2(
    titleInputComponentState,
    titleInputInstanceId,
  );

  useEffect(() => {
    if (settingsDraftRole.label === '' && !isTitleInputOpen) {
      setIsTitleInputOpen(true);
    }
  }, [
    settingsDraftRole.label,
    setIsTitleInputOpen,
    titleInputInstanceId,
    isTitleInputOpen,
  ]);

  return <></>;
};
