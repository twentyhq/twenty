import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { ViewOpenRecordIn } from 'twenty-shared/types';
import { IconLayoutNavbar, IconLayoutSidebarRight } from 'twenty-ui/icon';

export const OpenRecordInPreferenceSelect = () => {
  const { t } = useLingui();

  const { openRecordInPreference, setOpenRecordInPreference } =
    useOpenRecordInPreference();

  return (
    <Select
      dropdownId="open-record-in-preference-select"
      dropdownWidth={218}
      label={t`Open records in`}
      dropdownWidthAuto
      fullWidth
      value={openRecordInPreference}
      options={[
        {
          label: t`Side Panel`,
          value: ViewOpenRecordIn.SIDE_PANEL,
          Icon: IconLayoutSidebarRight,
        },
        {
          label: t`Record Page`,
          value: ViewOpenRecordIn.RECORD_PAGE,
          Icon: IconLayoutNavbar,
        },
      ]}
      onChange={setOpenRecordInPreference}
    />
  );
};
