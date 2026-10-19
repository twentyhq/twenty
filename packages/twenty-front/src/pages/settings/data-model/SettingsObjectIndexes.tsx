import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsObjectIndexesSection } from '@/settings/data-model/object-details/components/tabs/SettingsObjectIndexesSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

export const SettingsObjectIndexes = () => {
  const { t } = useLingui();
  const { objectNamePlural = '' } = useParams();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();
  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <SettingsPageLayout
      title={t`Indexes`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Objects`,
          href: getSettingsPath(SettingsPath.Objects),
        },
        {
          children: objectMetadataItem.labelPlural,
          href: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural,
          }),
        },
        { children: t`Indexes` },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`Indexes`}
            description={t`Speed up reads on the fields you filter or sort by most. Each index also slows down writes and uses disk space, so add them with intent.`}
          />
          <SettingsObjectIndexesSection
            objectMetadataItem={objectMetadataItem}
            isReadOnly={
              isObjectMetadataReadOnly({ objectMetadataItem }) || isDDLLocked
            }
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
