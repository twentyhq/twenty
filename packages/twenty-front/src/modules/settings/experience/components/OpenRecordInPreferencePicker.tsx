import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { OpenRecordInCardMedia } from '@/settings/experience/components/OpenRecordInCardMedia';
import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { msg } from '@lingui/core/macro';
import { OpenRecordIn } from 'twenty-shared/types';

const openRecordInPreferenceOptions = [
  {
    value: OpenRecordIn.SIDE_PANEL,
    title: msg`Side panel`,
    description: msg`Open records alongside the current page`,
    cardMedia: <OpenRecordInCardMedia type="side-panel" />,
  },
  {
    value: OpenRecordIn.RECORD_PAGE,
    title: msg`Full page`,
    description: msg`Open records on a dedicated page`,
    cardMedia: <OpenRecordInCardMedia type="full-page" />,
  },
];

export const OpenRecordInPreferencePicker = () => {
  const { openRecordInPreference, setOpenRecordInPreference } =
    useOpenRecordInPreference();

  const handleChange = (value: OpenRecordIn) => {
    void setOpenRecordInPreference(value);
  };

  return (
    <SettingsRadioSettingsCard
      name="open-record-in-preference"
      onChange={handleChange}
      options={openRecordInPreferenceOptions}
      value={openRecordInPreference}
    />
  );
};
