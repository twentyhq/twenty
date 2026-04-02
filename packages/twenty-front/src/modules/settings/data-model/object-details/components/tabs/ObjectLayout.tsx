import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconLayoutDashboard } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type ObjectLayoutProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectLayout = ({ objectMetadataItem }: ObjectLayoutProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const navigateApp = useNavigateApp();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  const { records } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields: { id: true },
    limit: 1,
  });

  const firstRecord = records[0];

  const handleCustomizeRecordPage = () => {
    if (!isDefined(firstRecord)) {
      return;
    }

    enterLayoutCustomizationMode();

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular: objectMetadataItem.nameSingular,
      objectRecordId: firstRecord.id,
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Customize`}
        description={t`Customize the layout for this role`}
      />
      <SettingsCard
        title={t`Customize record page`}
        Icon={<IconLayoutDashboard size={theme.icon.size.md} />}
        onClick={handleCustomizeRecordPage}
        disabled={!isDefined(firstRecord)}
      />
    </Section>
  );
};
