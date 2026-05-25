import { useContext } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconLayoutDashboard, IconReload } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useResetPageLayoutToDefault } from '@/page-layout/hooks/useResetPageLayoutToDefault';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const RESET_PAGE_LAYOUT_MODAL_ID = 'reset-page-layout-to-default-modal';

type ObjectLayoutProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectLayout = ({ objectMetadataItem }: ObjectLayoutProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const navigateApp = useNavigateApp();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const { openModal } = useModal();
  const { resetPageLayoutToDefault } = useResetPageLayoutToDefault();

  const pageLayout = useAtomFamilySelectorValue(
    recordPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

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

  const handleResetPageLayout = () => {
    openModal(RESET_PAGE_LAYOUT_MODAL_ID);
  };

  const handleConfirmReset = async () => {
    if (!isDefined(pageLayout)) {
      return;
    }

    await resetPageLayoutToDefault({
      pageLayoutId: pageLayout.id,
    });
  };

  return (
    <StyledContentContainer>
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
      <Section>
        <H2Title
          title={t`Reset`}
          description={t`Reset all overrides on this layout to return it to the app default`}
        />
        <Button
          title={t`Reset to default`}
          variant="secondary"
          size="small"
          Icon={IconReload}
          onClick={handleResetPageLayout}
          disabled={!isDefined(pageLayout)}
        />
      </Section>
      <ConfirmationModal
        modalInstanceId={RESET_PAGE_LAYOUT_MODAL_ID}
        title={t`Reset to default`}
        subtitle={t`This action cannot be undone.`}
        onConfirmClick={handleConfirmReset}
        confirmButtonText={t`Reset`}
        confirmButtonAccent="danger"
      />
    </StyledContentContainer>
  );
};
