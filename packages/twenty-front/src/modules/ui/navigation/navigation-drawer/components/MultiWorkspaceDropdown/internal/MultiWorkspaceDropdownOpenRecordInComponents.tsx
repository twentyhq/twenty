import { Dropdown } from 'twenty-ui/components/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { OPEN_RECORD_IN_OPTIONS } from '@/ui/navigation/navigation-drawer/constants/OpenRecordInOptions';
import { useLingui } from '@lingui/react/macro';
import { OpenRecordIn } from 'twenty-shared/types';

export const MultiWorkspaceDropdownOpenRecordInComponents = () => {
  const { t } = useLingui();

  const { openRecordInPreference, setOpenRecordInPreference } =
    useOpenRecordInPreference();

  return (
    <>
      <Dropdown.Back>{t`Open records in`}</Dropdown.Back>
      <Dropdown.Section>
        {Object.values(OpenRecordIn).map((openRecordIn) => (
          <Dropdown.OptionItem
            key={openRecordIn}
            startIcon={
              <SelectOptionIcon
                Icon={OPEN_RECORD_IN_OPTIONS[openRecordIn].Icon}
              />
            }
            onSelect={() => setOpenRecordInPreference(openRecordIn)}
            closeOnSelect={false}
            selected={openRecordIn === openRecordInPreference}
          >
            {t(OPEN_RECORD_IN_OPTIONS[openRecordIn].label)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
