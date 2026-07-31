import { useOpenRecordInDestinationOptions } from '@/settings/experience/hooks/useOpenRecordInDestinationOptions';
import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { OpenRecordIn } from 'twenty-shared/types';

export const OpenRecordInPreferenceSelect = () => {
  const { t } = useLingui();

  const { openRecordInPreference, setOpenRecordInPreference } =
    useOpenRecordInPreference();

  const destinationOptions = useOpenRecordInDestinationOptions({
    sidePanelValue: OpenRecordIn.SIDE_PANEL,
    recordPageValue: OpenRecordIn.RECORD_PAGE,
  });

  return (
    <Select
      dropdownId="open-record-in-preference-select"
      dropdownWidth={218}
      label={t`Open records in`}
      dropdownWidthAuto
      fullWidth
      value={openRecordInPreference}
      options={destinationOptions}
      onChange={setOpenRecordInPreference}
    />
  );
};
